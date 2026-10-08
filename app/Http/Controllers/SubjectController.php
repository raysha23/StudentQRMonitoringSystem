    <?php

    namespace App\Http\Controllers;

    use App\Models\Subject;
    use Illuminate\Http\Request;
    use Illuminate\Validation\Rule;

    class SubjectController extends Controller
    {
        public function index()
        {
            return Subject::with('course:CourseID,CourseCode')->orderByDesc('SubjectCode')->get();
        }

        public function store(Request $request)
        {
            $data = $request->validate([
                'SubjectCode'  => 'required|string|max:30|unique:subjects,SubjectCode',
                'SubjectTitle' => 'required|string|max:150',
                'CourseID'     => 'required|exists:courses,CourseID',
                'Units'        => 'nullable|integer|min:0|max:12',
            ]);

            return response()->json(
                Subject::create($data)->load('course:CourseID,CourseCode'),
                201
            );
        }

        public function show(Subject $subject)
        {
            return $subject->load('course:CourseID,CourseCode');
        }

        public function update(Request $request, Subject $subject)
        {
            $data = $request->validate([
                'SubjectCode'  => [
                    'sometimes',
                    'required',
                    'string',
                    'max:30',
                    Rule::unique('subjects', 'SubjectCode')
                        ->ignore($subject->SubjectID, 'SubjectID')
                ],
                'SubjectTitle' => 'sometimes|required|string|max:150',
                'CourseID'     => 'sometimes|required|exists:courses,CourseID',
                'Units'        => 'nullable|integer|min:0|max:12',
                'Status'       => 'sometimes|in:Active,Inactive',
            ]);

            $subject->update($data);

            return $subject->load('course:CourseID,CourseCode');
        }

        public function destroy(Subject $subject)
        {
            $subject->delete();

            return response()->noContent();
        }
    }
