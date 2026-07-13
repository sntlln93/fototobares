import { type SchoolShowController } from '../hooks/use-school-show';
import { CreateClassroom } from './create-classroom';
import { DeleteClassroomConfirmation } from './delete-classroom-confirmation';
import { EditClassroom } from './edit-classroom';

export function ClassroomModals({
    controller,
}: {
    controller: SchoolShowController;
}) {
    const {
        deleteableClassroom,
        setDeleteableClassroom,
        editableClassroom,
        setEditableClassroom,
        showAddClassroom,
        setShowAddClassroom,
    } = controller;

    return (
        <>
            {deleteableClassroom && (
                <DeleteClassroomConfirmation
                    classroom={deleteableClassroom}
                    show={Boolean(deleteableClassroom)}
                    onClose={() => setDeleteableClassroom(null)}
                />
            )}

            {editableClassroom && (
                <EditClassroom
                    classroom={editableClassroom}
                    show={Boolean(editableClassroom)}
                    onClose={() => setEditableClassroom(null)}
                />
            )}

            {showAddClassroom && (
                <CreateClassroom
                    school={showAddClassroom}
                    show={Boolean(showAddClassroom)}
                    onClose={() => setShowAddClassroom(null)}
                />
            )}
        </>
    );
}
