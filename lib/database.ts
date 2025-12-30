// Railway PostgreSQL database connection and property management

import { Pool, PoolClient } from 'pg';
import { ZillowPropertyData } from './zillow-parser';

export interface PropertyRecord {
  id: string;
  user_id: string;
  zpid: string;
  zillow_url: string;
  property_data: ZillowPropertyData;
  user_mortgage_data?: {
    mortgage_balance: number;
    monthly_payment: number;
    monthly_rent?: number;
    monthly_mortgage?: number;
    tenant_type?: string;
    management_type?: string;
    notes?: string;
  };
  created_at: Date;
  updated_at: Date;
}

class DatabaseManager {
  private static pool: Pool | null = null;

  static getPool(): Pool {
    if (!this.pool) {
      const connectionString = process.env.DATABASE_URL || 
        process.env.RAILWAY_DATABASE_URL || 
        'postgresql://localhost:5432/universal-ai-agent-team';
      
      this.pool = new Pool({
        connectionString,
        ssl: process.env.DB_SSL === 'true' ? {
          rejectUnauthorized: false
        } : false,
        max: parseInt(process.env.DB_POOL_MAX || '10'),
        min: parseInt(process.env.DB_POOL_MIN || '1'),
        connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
      });

      console.log('✅ PostgreSQL connection pool initialized');
    }
    return this.pool;
  }

  /**
   * Test database connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      const pool = this.getPool();
      const client = await pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();
      console.log('✅ Database connection successful:', result.rows[0].now);
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
  }

  /**
   * Save property data to Railway database (with duplicate prevention)
   */
  static async saveProperty(
    userId: string, 
    zillowData: ZillowPropertyData, 
    userMortgageData?: any
  ): Promise<PropertyRecord> {
    try {
      const pool = this.getPool();
      
      // Check for duplicate by address
      const normalizedAddress = `${zillowData.address}, ${zillowData.city}, ${zillowData.state} ${zillowData.zipCode}`.toLowerCase();
      
      console.log('Checking for duplicate property:', normalizedAddress);
      
      const duplicateCheck = await pool.query(`
        SELECT id, property_data 
        FROM user_properties 
        WHERE user_id = $1 
        AND LOWER(
          CONCAT(
            property_data->>'address', ', ',
            property_data->>'city', ', ',
            property_data->>'state', ' ',
            property_data->>'zipCode'
          )
        ) = $2
      `, [userId, normalizedAddress]);

      if (duplicateCheck.rows.length > 0) {
        console.log('⚠️ Duplicate property found, updating existing record:', duplicateCheck.rows[0].id);
        
        // Update existing property instead of creating duplicate
        const updateResult = await pool.query(`
          UPDATE user_properties 
          SET 
            property_data = $1,
            user_mortgage_data = $2,
            updated_at = $3
          WHERE id = $4 AND user_id = $5
          RETURNING *
        `, [
          JSON.stringify(zillowData),
          userMortgageData ? JSON.stringify(userMortgageData) : null,
          new Date(),
          duplicateCheck.rows[0].id,
          userId
        ]);

        const row = updateResult.rows[0];
        return {
          id: row.id,
          user_id: row.user_id,
          zpid: row.zpid,
          zillow_url: row.zillow_url,
          property_data: row.property_data,
          user_mortgage_data: row.user_mortgage_data,
          created_at: row.created_at,
          updated_at: row.updated_at
        };
      }

      // No duplicate found, create new property
      const propertyId = `prop_${Date.now()}`;
      
      console.log('Creating new property in Railway database:', {
        property_id: propertyId,
        address: zillowData.address,
        zpid: zillowData.zpid
      });

      const result = await pool.query(`
        INSERT INTO user_properties 
        (id, user_id, zpid, zillow_url, property_data, user_mortgage_data, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        propertyId,
        userId,
        zillowData.zpid || '',
        zillowData.zillowUrl,
        JSON.stringify(zillowData),
        userMortgageData ? JSON.stringify(userMortgageData) : null,
        new Date(),
        new Date()
      ]);

      const row = result.rows[0];
      const propertyRecord: PropertyRecord = {
        id: row.id,
        user_id: row.user_id,
        zpid: row.zpid,
        zillow_url: row.zillow_url,
        property_data: typeof row.property_data === 'string' ? JSON.parse(row.property_data) : row.property_data,
        user_mortgage_data: row.user_mortgage_data ? 
          (typeof row.user_mortgage_data === 'string' ? JSON.parse(row.user_mortgage_data) : row.user_mortgage_data) : undefined,
        created_at: row.created_at,
        updated_at: row.updated_at
      };

      console.log('✅ Property saved successfully to database');
      return propertyRecord;
    } catch (error) {
      console.error('❌ Error saving property to database:', error);
      throw new Error('Failed to save property to database');
    }
  }

  /**
   * Get all properties for a user
   */
  static async getUserProperties(userId: string): Promise<PropertyRecord[]> {
    try {
      const pool = this.getPool();
      const result = await pool.query(`
        SELECT * FROM user_properties 
        WHERE user_id = $1 
        ORDER BY created_at DESC
      `, [userId]);
      
      return result.rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        zpid: row.zpid,
        zillow_url: row.zillow_url,
        property_data: typeof row.property_data === 'string' ? JSON.parse(row.property_data) : row.property_data,
        user_mortgage_data: row.user_mortgage_data ? 
          (typeof row.user_mortgage_data === 'string' ? JSON.parse(row.user_mortgage_data) : row.user_mortgage_data) : undefined,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));
    } catch (error) {
      console.error('Error fetching user properties:', error);
      throw new Error('Failed to fetch user properties');
    }
  }

  /**
   * Update property mortgage/rental information
   */
  static async updatePropertyMortgageData(
    propertyId: string, 
    mortgageData: any
  ): Promise<PropertyRecord | null> {
    try {
      const pool = this.getPool();
      const result = await pool.query(`
        UPDATE user_properties 
        SET user_mortgage_data = $1, updated_at = $2
        WHERE id = $3
        RETURNING *
      `, [JSON.stringify(mortgageData), new Date(), propertyId]);
      
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      return {
        id: row.id,
        user_id: row.user_id,
        zpid: row.zpid,
        zillow_url: row.zillow_url,
        property_data: typeof row.property_data === 'string' ? JSON.parse(row.property_data) : row.property_data,
        user_mortgage_data: row.user_mortgage_data ? 
          (typeof row.user_mortgage_data === 'string' ? JSON.parse(row.user_mortgage_data) : row.user_mortgage_data) : undefined,
        created_at: row.created_at,
        updated_at: row.updated_at
      };
    } catch (error) {
      console.error('Error updating property mortgage data:', error);
      throw new Error('Failed to update property mortgage data');
    }
  }

  /**
   * Create the necessary database tables if they don't exist
   */
  static async initializeTables(): Promise<void> {
    try {
      const pool = this.getPool();
      
      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_properties (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          zpid VARCHAR(50),
          zillow_url TEXT NOT NULL,
          property_data JSONB NOT NULL,
          user_mortgage_data JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_user_properties_user_id ON user_properties(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_properties_zpid ON user_properties(zpid);
      `);

      console.log('✅ Database tables initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing database tables:', error);
      throw new Error('Failed to initialize database tables');
    }
  }
}

export { DatabaseManager };

/**
 * API endpoint helper to save a property from Zillow data
 */
export async function savePropertyFromZillow(
  userId: string,
  zillowData: ZillowPropertyData,
  mortgageData?: {
    mortgage_balance?: number;
    monthly_payment?: number;
    monthly_rent?: number;
    monthly_mortgage?: number;
    tenant_type?: string;
    management_type?: string;
    notes?: string;
  }
): Promise<PropertyRecord> {
  
  const property = await DatabaseManager.saveProperty(userId, zillowData, mortgageData);
  
  console.log('Property saved successfully:', {
    property_id: property.id,
    address: zillowData.address,
    zestimate: zillowData.zestimate,
    user_id: userId
  });
  
  return property;
}
