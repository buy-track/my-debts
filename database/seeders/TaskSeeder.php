<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a demo user if it doesn't exist
        $user = User::firstOrCreate(
            ['email' => 'demo@example.com'],
            [
                'name' => 'Demo User',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        // Create some tasks for February 2022 (matching the original sample data)
        Task::create([
            'user_id' => $user->id,
            'text' => 'Buy dark chocolate',
            'date' => '2022-02-01',
            'completed' => false,
        ]);

        Task::create([
            'user_id' => $user->id,
            'text' => 'Make chocolate dessert',
            'date' => '2022-02-01',
            'completed' => true,
        ]);

        Task::create([
            'user_id' => $user->id,
            'text' => 'Buy Valentine\'s gift',
            'date' => '2022-02-14',
            'completed' => false,
        ]);

        Task::create([
            'user_id' => $user->id,
            'text' => 'Make dinner reservation',
            'date' => '2022-02-14',
            'completed' => true,
        ]);

        Task::create([
            'user_id' => $user->id,
            'text' => 'Order flowers',
            'date' => '2022-02-14',
            'completed' => false,
        ]);

        Task::create([
            'user_id' => $user->id,
            'text' => 'Buy chocolate mint ice cream',
            'date' => '2022-02-19',
            'completed' => false,
        ]);

        Task::create([
            'user_id' => $user->id,
            'text' => 'Try mint chocolate recipe',
            'date' => '2022-02-19',
            'completed' => false,
        ]);

        Task::create([
            'user_id' => $user->id,
            'text' => 'Visit President\'s Day sale',
            'date' => '2022-02-21',
            'completed' => false,
        ]);

        // Create some additional random tasks
        Task::factory()->count(10)->create([
            'user_id' => $user->id,
        ]);
    }
}