<?php

namespace App\Providers;

use App\Models\Article;
use App\Models\Award;
use App\Models\CollectionItem;
use App\Models\Lead;
use App\Models\Page;
use App\Models\Project;
use App\Models\Redirect;
use App\Models\Service;
use App\Models\Setting;
use App\Models\User;
use App\Policies\ArticlePolicy;
use App\Policies\AwardPolicy;
use App\Policies\CollectionItemPolicy;
use App\Policies\LeadPolicy;
use App\Policies\PagePolicy;
use App\Policies\ProjectPolicy;
use App\Policies\RedirectPolicy;
use App\Policies\ServicePolicy;
use App\Policies\SettingPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * @var array<class-string, class-string>
     */
    protected array $policies = [
        Project::class => ProjectPolicy::class,
        Service::class => ServicePolicy::class,
        Article::class => ArticlePolicy::class,
        CollectionItem::class => CollectionItemPolicy::class,
        Award::class => AwardPolicy::class,
        Page::class => PagePolicy::class,
        Lead::class => LeadPolicy::class,
        Redirect::class => RedirectPolicy::class,
        Setting::class => SettingPolicy::class,
    ];

    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        foreach ($this->policies as $model => $policy) {
            Gate::policy($model, $policy);
        }

        Gate::before(function (User $user, string $ability) {
            if ($user->hasRole('super-admin')) {
                return true;
            }

            return null;
        });
    }
}
