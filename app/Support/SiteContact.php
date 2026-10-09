<?php

namespace App\Support;

use App\Models\Setting;

class SiteContact
{
    /**
     * Contact links + labels for public Inertia pages (from admin Settings).
     *
     * @return array{
     *     phone: string,
     *     callLink: string,
     *     whatsapp: string,
     *     whatsappLink: string,
     *     email: string,
     *     address: string
     * }
     */
    public static function shared(): array
    {
        $phone = trim((string) Setting::get('contact_phone', '+971 56 790 7213'));
        $whatsapp = trim((string) Setting::get('whatsapp_number', '971567907213'));
        $email = trim((string) Setting::get('contact_email', 'info@smartrenovation.ae'));
        $address = trim((string) Setting::get('contact_address', ''));

        $telDigits = preg_replace('/[^\d+]/', '', $phone) ?? '';
        if ($telDigits !== '' && ! str_starts_with($telDigits, '+')) {
            $telDigits = '+'.ltrim($telDigits, '+');
        }

        $waDigits = preg_replace('/\D/', '', $whatsapp) ?? '';

        return [
            'phone' => $phone !== '' ? $phone : '+971 56 790 7213',
            'callLink' => $telDigits !== '' ? 'tel:'.$telDigits : 'tel:+971567907213',
            'whatsapp' => $waDigits !== '' ? $waDigits : '971567907213',
            'whatsappLink' => $waDigits !== '' ? 'https://wa.me/'.$waDigits : 'https://wa.me/971567907213',
            'email' => $email !== '' ? $email : 'info@smartrenovation.ae',
            'address' => $address,
        ];
    }
}
