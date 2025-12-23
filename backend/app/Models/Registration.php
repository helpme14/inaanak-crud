<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Registration extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference_number',
        'guardian_id',
        'inaanak_name',
        'inaanak_birthdate',
        'relationship',
        'live_photo_path',
        'video_path',
        'qr_code_path',
        'status',
        'rejection_reason',
    ];

    protected $casts = [
        'inaanak_birthdate' => 'date',
    ];

    public function guardian()
    {
        return $this->belongsTo(Guardian::class);
    }

    public static function generateReferenceNumber()
    {
        $date = now()->format('Y-m-d');
        $count = self::whereDate('created_at', now()->toDateString())->count() + 1;
        return 'REG-' . $date . '-' . str_pad($count, 3, '0', STR_PAD_LEFT);
    }
}
