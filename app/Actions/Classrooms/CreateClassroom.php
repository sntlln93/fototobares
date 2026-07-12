<?php

declare(strict_types=1);

namespace App\Actions\Classrooms;

use App\Contracts\ActionContract;
use App\Enums\ContactRole;
use App\Models\Classroom;
use Illuminate\Support\Facades\DB;

class CreateClassroom implements ActionContract
{
    /**
     * Create a classroom and, when teacher data is provided, its teacher
     * contact.
     *
     * @param  array<string, mixed>  $params  validated classroom payload
     */
    public function handle(array $params): void
    {
        DB::transaction(function () use ($params) {
            $classroom = Classroom::create([
                'name' => $params['name'],
                'school_id' => $params['school_id'],
            ]);

            if ($params['teacher'] !== null || $params['phone'] !== null) {
                $classroom->teacher()->create([
                    'name' => $params['teacher'],
                    'phone' => $params['phone'],
                    'role' => ContactRole::Teacher,
                ]);
            }
        });
    }
}
