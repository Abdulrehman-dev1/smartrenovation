<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRedirectRequest;
use App\Http\Requests\Admin\UpdateRedirectRequest;
use App\Models\Redirect;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class RedirectController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Redirect::class);

        return Inertia::render('Admin/Redirects/Index', [
            'redirects' => Redirect::query()->latest()->paginate(20),
            'can' => [
                'create' => request()->user()->can('redirects.create'),
                'edit' => request()->user()->can('redirects.edit'),
                'delete' => request()->user()->can('redirects.delete'),
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Redirect::class);

        return Inertia::render('Admin/Redirects/Create');
    }

    public function store(StoreRedirectRequest $request): RedirectResponse
    {
        $redirect = Redirect::query()->create($request->validated());

        return redirect()
            ->route('admin.redirects.edit', $redirect)
            ->with('success', 'Redirect was successfully created.');
    }

    public function edit(Redirect $redirect): Response
    {
        $this->authorize('update', $redirect);

        return Inertia::render('Admin/Redirects/Edit', [
            'redirect' => $redirect,
        ]);
    }

    public function update(UpdateRedirectRequest $request, Redirect $redirect): RedirectResponse
    {
        $redirect->update($request->validated());

        return redirect()
            ->route('admin.redirects.edit', $redirect)
            ->with('success', 'Redirect was successfully updated.');
    }

    public function destroy(Redirect $redirect): RedirectResponse
    {
        $this->authorize('delete', $redirect);

        $redirect->delete();

        return redirect()
            ->route('admin.redirects.index')
            ->with('success', 'Redirect was successfully deleted.');
    }
}
