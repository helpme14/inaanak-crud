<?php

namespace App\Models;

use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use App\Notifications\NinongVerifyEmail;
use Illuminate\Notifications\Notifiable;

class Ninong extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, MustVerifyEmailTrait;

    protected $fillable = [
        'name', 'email', 'password', 'email_verified_at', 'verification_code', 'verification_code_expires_at'
    ];

    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new NinongVerifyEmail());
    }

    protected $hidden = [
        'password', 'remember_token',
    ];

    public function invites()
    {
        return $this->hasMany(NinongInvite::class);
    }

    public function registrations()
    {
        return $this->hasMany(Registration::class);
    }
}