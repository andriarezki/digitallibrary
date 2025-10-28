// Quick script to clean up categories
// Run with: node cleanup_categories.js

const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function cleanupCategories() {
    console.log('🧹 Category Cleanup Tool');
    console.log('This will remove all categories except:');
    console.log('Book, Journal, Proceeding, Audio Visual, Catalogue, Flyer, Training, Poster, Thesis, Report, Newspaper');
    console.log('');
    
    rl.question('Are you sure you want to proceed? (yes/no): ', async (answer) => {
        if (answer.toLowerCase() !== 'yes') {
            console.log('❌ Cleanup cancelled.');
            rl.close();
            return;
        }
        
        try {
            console.log('🔄 Calling cleanup API...');
            
            // First login as admin
            const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user: 'admin',
                    pass: 'admin123'
                })
            });
            
            if (!loginResponse.ok) {
                throw new Error('Failed to login as admin');
            }
            
            const cookies = loginResponse.headers.get('set-cookie');
            
            // Call cleanup endpoint
            const cleanupResponse = await fetch('http://localhost:5000/api/categories/cleanup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': cookies
                }
            });
            
            const result = await cleanupResponse.json();
            
            if (cleanupResponse.ok) {
                console.log('✅ Success:', result.message);
                console.log('🎉 Category cleanup completed!');
            } else {
                console.log('❌ Error:', result.message);
            }
            
        } catch (error) {
            console.log('❌ Network error:', error.message);
            console.log('💡 Make sure your server is running on http://localhost:5000');
        }
        
        rl.close();
    });
}

cleanupCategories();