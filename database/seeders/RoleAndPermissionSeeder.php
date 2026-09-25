<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $modules = [
            'projects',
            'services',
            'articles',
            'press',
            'collection_items',
            'awards',
            'pages',
            'leads',
            'redirects',
            'settings',
        ];

        $actions = ['viewAny', 'view', 'create', 'edit', 'delete'];

        $permissions = [];
        foreach ($modules as $module) {
            foreach ($actions as $action) {
                if ($module === 'leads' && in_array($action, ['create', 'edit'], true)) {
                    continue;
                }
                if ($module === 'settings' && in_array($action, ['create', 'delete'], true)) {
                    continue;
                }
                $permissions[] = "{$module}.{$action}";
            }
        }

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission);
        }

        $superAdmin = Role::findOrCreate('super-admin');
        $superAdmin->syncPermissions(Permission::all());

        $editor = Role::findOrCreate('editor');
        $editorPermissions = collect($permissions)->filter(function (string $permission) {
            return ! str_starts_with($permission, 'settings.')
                && ! str_starts_with($permission, 'redirects.')
                && ! str_ends_with($permission, '.delete');
        })->values()->all();

        $editor->syncPermissions($editorPermissions);
    }
}
