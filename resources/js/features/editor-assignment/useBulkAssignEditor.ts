import { useForm } from '@inertiajs/react';

export function useBulkAssignEditor({
    schoolId,
    classroomId,
}: {
    schoolId?: number;
    classroomId?: number;
}) {
    const form = useForm({
        editor_id: '',
        product_ids: [] as number[],
        school_id: schoolId ?? null,
        classroom_id: classroomId ?? null,
    });

    const submit = (onSuccess: () => void) => {
        form.post(route('editor-assignments.bulk'), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onSuccess();
            },
        });
    };

    return { ...form, submit };
}
