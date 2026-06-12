<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\News;
use Illuminate\Http\Request;

class NewsController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            News::where('company_id', $request->user()->company_id)
                ->orderByDesc('created_at')
                ->paginate(20)
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'   => 'required|string|max:255',
            'tag'     => 'required|string|max:100',
            'excerpt' => 'required|string|max:500',
            'body'    => 'nullable|string',
            'status'  => 'required|in:draft,published',
        ]);

        $news = News::create(array_merge($data, [
            'company_id'   => $request->user()->company_id,
            'created_by'   => $request->user()->id,
            'published_at' => $data['status'] === 'published' ? now() : null,
        ]));

        return response()->json($news, 201);
    }

    public function update(Request $request, News $news)
    {
        $data = $request->validate([
            'title'   => 'sometimes|string|max:255',
            'tag'     => 'sometimes|string|max:100',
            'excerpt' => 'sometimes|string|max:500',
            'body'    => 'nullable|string',
            'status'  => 'sometimes|in:draft,published',
        ]);

        if (isset($data['status']) && $data['status'] === 'published' && !$news->published_at) {
            $data['published_at'] = now();
        }

        $news->update($data);

        return response()->json($news);
    }

    public function destroy(News $news)
    {
        $news->delete();
        return response()->json(null, 204);
    }
}
