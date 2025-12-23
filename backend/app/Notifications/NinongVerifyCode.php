<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NinongVerifyCode extends Notification
{
    use Queueable;

    public function __construct(
        public string $code
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your Ninong Verification Code')
            ->line('Use the verification code below to verify your email:')
            ->line('')
            ->line('Code: ' . $this->code)
            ->line('')
            ->line('This code will expire in 10 minutes.')
            ->line('If you did not create a Ninong account, no further action is required.');
    }
}
