<?php

declare(strict_types=1);

namespace App\Http\Controllers\BO;

use App\Actions\Users\CreateUser;
use App\Actions\Users\DeleteUser;
use App\Actions\Users\UpdateUser;
use App\Http\Controllers\Controller;
use App\Http\Requests\BO\StoreUserRequest;
use App\Http\Requests\BO\UpdateUserRequest;
use App\Models\Role;
use App\Models\School;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        $users = User::with('roles')->orderBy('name')->get();

        return Inertia::render('users/index', [
            'users' => $users->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roleNames(),
            ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('users/create', [
            'roles' => Role::all(['id', 'name']),
        ]);
    }

    public function store(StoreUserRequest $request, CreateUser $action): RedirectResponse
    {
        $action->handle($request->validated());

        return redirect()->route('users.index')->with('success', 'Usuario creado exitosamente');
    }

    public function edit(User $user): Response
    {
        $user->load('roles');

        return Inertia::render('users/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('id'),
            ],
            'roles' => Role::all(['id', 'name']),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user, UpdateUser $action): RedirectResponse
    {
        $action->handle(['user' => $user, 'data' => $request->validated()]);

        return redirect()->route('users.index')->with('success', 'Usuario actualizado exitosamente');
    }

    public function destroy(Request $request, User $user, DeleteUser $action): RedirectResponse
    {
        if ($request->user()?->id === $user->id) {
            return back()->withErrors(['user' => 'No podés eliminar tu propio usuario.']);
        }

        if (School::where('user_id', $user->id)->exists()) {
            return back()->withErrors(['user' => 'No se puede eliminar: el usuario es encargado de al menos una escuela.']);
        }

        $action->handle(['user' => $user]);

        return redirect()->route('users.index')->with('success', 'Usuario eliminado');
    }
}
