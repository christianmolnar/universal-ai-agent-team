// Script to clean up property photos - keep only first 3 quality photos
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

async function cleanupPhotos() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to database...');
    
    // Get all properties
    const result = await pool.query('SELECT id, property_data FROM user_properties');
    console.log(`Found ${result.rows.length} properties`);

    for (const row of result.rows) {
      const propertyData = row.property_data;
      const originalPhotoCount = propertyData.photos?.length || 0;

      if (propertyData.photos && propertyData.photos.length > 0) {
        // Filter and limit photos
        const cleanedPhotos = propertyData.photos
          .filter(url => 
            url &&
            !url.includes('tracking') &&
            !url.includes('pixel') &&
            !url.includes('1x1') &&
            url.includes('photos.zillowstatic.com')
          )
          .slice(0, 3);

        propertyData.photos = cleanedPhotos;

        // Update in database
        await pool.query(
          'UPDATE user_properties SET property_data = $1, updated_at = $2 WHERE id = $3',
          [JSON.stringify(propertyData), new Date(), row.id]
        );

        console.log(`✅ ${propertyData.address}: ${originalPhotoCount} → ${cleanedPhotos.length} photos`);
      } else {
        console.log(`⚠️  ${propertyData.address}: No photos`);
      }
    }

    console.log('\n✅ Photo cleanup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

cleanupPhotos();
