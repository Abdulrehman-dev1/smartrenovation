<?php

namespace Tests\Unit;

use App\Support\HtmlContent;
use PHPUnit\Framework\TestCase;

class HtmlContentTest extends TestCase
{
    public function test_it_keeps_safe_rich_text_tags(): void
    {
        $html = '<h2>Title</h2><p>Hello <strong>world</strong></p><ul><li>One</li></ul>'
            .'<a href="https://example.com">Link</a>'
            .'<img src="https://cdn.example.com/photo.jpg" alt="Photo">'
            .'<iframe src="https://www.youtube.com/embed/abc123"></iframe>';

        $clean = HtmlContent::sanitize($html);

        $this->assertStringContainsString('<h2>Title</h2>', $clean);
        $this->assertStringContainsString('<strong>world</strong>', $clean);
        $this->assertStringContainsString('<ul><li>One</li></ul>', $clean);
        $this->assertStringContainsString('href="https://example.com"', $clean);
        $this->assertStringContainsString('<img src="https://cdn.example.com/photo.jpg"', $clean);
        $this->assertStringContainsString('youtube.com/embed/abc123', $clean);
    }

    public function test_it_strips_scripts_and_unsafe_iframes(): void
    {
        $html = '<p>Safe</p><script>alert(1)</script>'
            .'<iframe src="https://evil.example.com/x"></iframe>'
            .'<a href="javascript:alert(1)">bad</a>';

        $clean = HtmlContent::sanitize($html);

        $this->assertStringContainsString('<p>Safe</p>', $clean);
        $this->assertStringNotContainsString('<script>', $clean);
        $this->assertStringNotContainsString('evil.example.com', $clean);
        $this->assertStringNotContainsString('javascript:', $clean);
    }
}
