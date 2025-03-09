<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureModels();

        $this->configureURLs();

        Gate::define('viewPulse', function (User $user) {
            return $user->email === 'sntlln.93@gmail.com';
        });

        $this->configureVite();
    }

    private function configureVite(): void
    {
        Vite::prefetch(concurrency: 3);
    }

    private function configureURLs(): void
    {
        if ($this->isProduction()) {
            URL::forceScheme('https');
        }
    }

    private function configureModels(): void
    {
        Model::shouldBeStrict();
        Model::unguard();
    }

    private function isProduction(): bool
    {
        return $this->app->environment() === 'production';
    }
}
