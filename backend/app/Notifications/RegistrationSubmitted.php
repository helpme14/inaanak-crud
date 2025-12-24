<?php

namespace App\Notifications;

use App\Models\Registration;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RegistrationSubmitted extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Registration $registration)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('INAANAK Registration Submitted - ' . $this->registration->reference_number)
            ->greeting('Hello ' . $this->registration->guardian->name . ',')
            ->line('Your registration for INAANAK Aguinaldo has been successfully submitted.')
            ->line('Reference Number: ' . $this->registration->reference_number)
            ->line('Child Name: ' . $this->registration->inaanak_name)
            ->line('Status: Pending Review')
            ->line('')
            ->line('Our team will review your application and documents within 3-5 business days.')
            ->line('You will receive an email notification once the review is complete.')
            // Link to the frontend status page and prefill reference number (+ guardian email)
            ->action(
                'View Registration Status',
                (env('FRONTEND_URL', 'http://localhost:5173'))
                    . '/check-status?ref=' . urlencode($this->registration->reference_number)
                    . '&email=' . urlencode($this->registration->guardian->email)
            )
            ->line('Thank you for registering with INAANAK!')
            ->salutation('Best regards, INAANAK Team')
            ->line('© 2025 GIOSICAT. All rights reserved.');
    }
}