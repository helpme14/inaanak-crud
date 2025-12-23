<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NinongInvite extends Model
{
    use HasFactory;

    protected $fillable = [
        'ninong_id', 'code', 'usage_limit', 'used_count', 'expires_at'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function ninong()
    {
        return $this->belongsTo(Ninong::class);
    }
}
