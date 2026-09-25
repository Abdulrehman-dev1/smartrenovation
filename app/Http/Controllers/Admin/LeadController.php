<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeadController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Lead::class);

        $filters = [
            'search' => trim((string) $request->string('search')),
        ];

        $query = Lead::query()->latest();

        if ($filters['search'] !== '') {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        return Inertia::render('Admin/Leads/Index', [
            'leads' => $query->paginate(20)->withQueryString(),
            'filters' => $filters,
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
