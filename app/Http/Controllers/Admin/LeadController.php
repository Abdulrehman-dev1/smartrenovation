<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class LeadController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Lead::class);

        return Inertia::render('Admin/Leads/Index', [
            'leads' => Lead::query()->latest()->paginate(20),
            'can' => [
                'delete' => request()->user()->can('leads.delete'),
            ],
        ]);
    }

    public function show(Lead $lead): Response
    {
        $this->authorize('view', $lead);

        return Inertia::render('Admin/Leads/Show', [
            'lead' => $lead,
            'can' => [
                'delete' => request()->user()->can('leads.delete'),
            ],
        ]);
    }

    public function destroy(Lead $lead): RedirectResponse
    {
        $this->authorize('delete', $lead);

        $lead->delete();

        return redirect()
            ->route('admin.leads.index')
            ->with('success', 'Lead was successfully deleted.');
    }
}
