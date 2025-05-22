<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('text');
            $table->date('date');
            $table->boolean('completed')->default(false);
            $table->decimal('amount', 10, 2)->nullable();
            $table->string('recipient')->nullable();
            $table->boolean('is_recurring')->default(false);
            $table->integer('recurrence_months')->nullable();
            $table->integer('remaining_occurrences')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};