/**
 * Prune Data Script for binAware - Maximize Spread
 * 
 * Deletes 50% of existing items by iteratively removing the closest pairs.
 * This ensures the remaining items are as spread out as possible ("spreaded").
 * Usage: node pruneData.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Report = require('./models/Report');
const Bin = require('./models/Bin');

// Helper: Haversine distance in Meters
function getDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

// Algorithm: Iteratively find the two closest points and remove one of them
// until target count is reached.
async function pruneCollection(Model, name) {
    console.log(`\n🔍 Analyzing ${name}...`);
    // Fetch all items
    let items = await Model.find({});
    const initialCount = items.length;
    console.log(`   Found ${initialCount} ${name}.`);

    if (initialCount === 0) return;

    const targetCount = Math.floor(initialCount / 2);
    let currentCount = initialCount;
    const toDeleteIds = [];

    // Convert to simple objects for faster processing
    // We maintain a list of active items
    let activeItems = items.map(i => ({
        id: i._id.toString(),
        lat: i.lat,
        lng: i.lng
    }));

    console.log(`   Targeting ${targetCount} items (pruning ~50%)...`);

    while (activeItems.length > targetCount) {
        let minDist = Infinity;
        let pairToRemove = null; // Index of item to remove

        // Find closest pair O(N^2) - Acceptable for N < 1000
        for (let i = 0; i < activeItems.length; i++) {
            for (let j = i + 1; j < activeItems.length; j++) {
                const dist = getDistanceMeters(
                    activeItems[i].lat, activeItems[i].lng,
                    activeItems[j].lat, activeItems[j].lng
                );

                if (dist < minDist) {
                    minDist = dist;
                    // Heuristic: remove the one that is "more crowded" locally? 
                    // For simplicity and speed, just picking the second one (j) is fine,
                    // or random. Let's pick j.
                    pairToRemove = j;
                }
            }
        }

        if (pairToRemove !== null) {
            // Add to delete list
            toDeleteIds.push(activeItems[pairToRemove].id);
            // Remove from active list
            activeItems.splice(pairToRemove, 1);
        } else {
            // Should not happen unless only 1 item left
            break;
        }
    }

    console.log(`   Identified ${toDeleteIds.length} ${name} to prune to maximize spread.`);

    // Perform deletion
    if (toDeleteIds.length > 0) {
        await Model.deleteMany({ _id: { $in: toDeleteIds } });
        console.log(`✅ Deleted ${toDeleteIds.length} ${name}.`);
    }

    const finalCount = await Model.countDocuments();
    console.log(`   Remaining ${name}: ${finalCount}`);
}

async function pruneData() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.ATLAS_URI);
        console.log('✅ Connected\n');

        await pruneCollection(Report, 'reports');
        await pruneCollection(Bin, 'bins');

        console.log('\n✨ Pruning complete! Data is now "spreaded" (maximized separation).');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected');
    }
}

pruneData();
