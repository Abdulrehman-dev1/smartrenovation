<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PressItemPdfRequest;
use App\Models\PressItem;
use App\Support\PressItemStorage;
use Illuminate\Http\JsonResponse;

class PressPdfController extends Controller
{
    public function __construct(private PressItemStorage $storage) {}

    public function store(PressItemPdfRequest $request, PressItem $press): JsonResponse
    {
        $this->authorizePress();

        $this->storage->storePdf($press, $request->file('pdf'));
        $press->refresh();

        return response()->json([
            'message' => 'PDF uploaded.',
            'pdf' => $press->pdf_path
                ? [
                    'path' => $press->pdf_path,
                    'url' => $press->pdfUrl(),
                    'name' => basename($press->pdf_path),
                ]
                : null,
        ]);
    }

    public function destroy(PressItem $press): JsonResponse
    {
        $this->authorizePress();

        $this->storage->clearPdf($press);

        return response()->json(['message' => 'PDF deleted.']);
    }

    private function authorizePress(): void
    {
        $user = request()->user();
        abort_unless(
            $user && ($user->can('press.edit') || $user->can('press.create')),
            403
        );
    }
}
