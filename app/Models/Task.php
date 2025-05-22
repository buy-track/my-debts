<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\JalaliDateTrait;

class Task extends Model
{
    use HasFactory, JalaliDateTrait;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'text',
        'date',
        'completed',
        'user_id',
        'amount',
        'recipient',
        'is_recurring',
        'recurrence_months',
        'remaining_occurrences',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'completed' => 'boolean',
        'date' => 'date',
        'amount' => 'decimal:2',
        'is_recurring' => 'boolean',
        'recurrence_months' => 'integer',
        'remaining_occurrences' => 'integer',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = [
        'jalali_date',
        'formatted_jalali_date'
    ];

    /**
     * Get the user that owns the task.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}