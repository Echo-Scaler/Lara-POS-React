<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_no',
        'customer_id',
        'user_id',
        'subtotal',
        'discount_amount',
        'tax',
        'total',
        'notes',
        'status',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'subtotal'        => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'tax'             => 'decimal:2',
            'total'           => 'decimal:2',
            'paid_at'         => 'datetime',
        ];
    }

    public static function generateOrderNo(): string
    {
        $prefix = 'ORD';
        $date   = now()->format('Ymd');
        $count  = static::whereDate('created_at', today())->count() + 1;
        return sprintf('%s-%s-%04d', $prefix, $date, $count);
    }

    // Relationships
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function inventoryMovements(): HasMany
    {
        return $this->hasMany(InventoryMovement::class);
    }

    // Scopes
    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', 'completed');
    }

    public function scopeForDate(Builder $query, string $date): Builder
    {
        return $query->whereDate('created_at', $date);
    }

    public function scopeForDateRange(Builder $query, string $from, string $to): Builder
    {
        return $query->whereBetween('created_at', [$from, $to]);
    }
}
