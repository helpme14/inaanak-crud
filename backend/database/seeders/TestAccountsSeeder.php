<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Admin;
use App\Models\Guardian;
use Illuminate\Support\Facades\Hash;

class TestAccountsSeeder extends Seeder
{
    public function run(): void
    {
        // Create test admin account
        Admin::create([
            'name' => 'Admin User',
            'email' => 'sicatgio14@gmail.com',
            'password' => Hash::make('cpesicatgio14x1414'),
        ]);

        // Create test guardian account
        // Guardian::create([
        //     'name' => 'Juan Dela Cruz',
        //     'email' => 'guardian@example.com',
        //     'password' => Hash::make('guardian123456'),
        //     'contact_number' => '+63 912 345 6789',
        //     'address' => '123 Main Street, Manila, Philippines',
        // ]);

        // echo "✅ Test accounts created!\n";
        // echo "Admin: admin@inaanak.ph / admin123456\n";
        // echo "Guardian: guardian@example.com / guardian123456\n";
    }
}