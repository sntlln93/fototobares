<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
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
        $this->configureCommands();

        $this->configureModels();

        $this->configureURLs();

        Gate::define('viewPulse', function (User $user) {
            return $user->email === 'sntlln.93@gmail.com';
        });

        $this->configureVite();
    }

    private function configureVite()
    {
        Vite::prefetch(concurrency: 3);
    }

    private function configureURLs()
    {
        if ($this->isProduction()) {
            URL::forceScheme('https');
        }
    }

    private function configureCommands()
    {
        DB::prohibitDestructiveCommands($this->isProduction());
    }

    private function configureModels()
    {
        Model::shouldBeStrict();
        Model::unguard();
    }

    private function isProduction()
    {
        return $this->app->environment() === 'production';
    }
}
