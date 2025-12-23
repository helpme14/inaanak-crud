<?php

namespace App\Notifications;

use App\Models\Registration;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RegistrationStatusUpdated extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private Registration $registration)
    {
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $status = ucfirst($this->registration->status);
        $reference = $this->registration->reference_number;
        $reason = $this->registration->rejection_reason;

        $mail = (new MailMessage)
            ->subject("Your registration status: {$status}")
            ->greeting('Hello!')
            ->line("Your registration (Ref: {$reference}) status is now {$status}.");

        if ($reason) {
            $mail->line('Rejection reason:')->line($reason);
        }

        return $mail
            ->line('Thank you for using our registration portal.')
            ->salutation('© 2025 GIOSICAT. All rights reserved.');
    }
}
