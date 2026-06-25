import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import PageHeader from '../components/PageHeader.jsx';
import { authApi } from '../api/resources';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPoints, setNewPoints] = useState(0);

  async function load() {
    const data = await authApi.listUsers();
    setUsers(data);
  }

  useEffect(() => {
    load();
  }, []);

  function openEdit(user) {
    setSelectedUser(user);
    setNewPoints(user.points);
    setDialogOpen(true);
  }

  async function save() {
    await authApi.updateUserPoints(selectedUser._id, newPoints);
    setDialogOpen(false);
    load();
  }

  const roleBody = (row) => {
    return <Tag value={row.role} severity={row.role === 'admin' ? 'danger' : 'info'} />;
  };

  const actions = (row) => (
    <div className="table-actions">
      <Button
        icon="pi pi-pencil"
        rounded
        text
        aria-label="Edit points"
        onClick={() => openEdit(row)}
      />
    </div>
  );

  return (
    <>
      <PageHeader title="User Management" eyebrow="Admin">
        Manage user points and view user information.
      </PageHeader>

      <section className="summary-panel">
        <h2>All Users</h2>
        <DataTable
          value={users}
          paginator
          rows={10}
          responsiveLayout="scroll"
          className="responsive-table"
        >
          <Column field="username" header="Username" />
          <Column field="email" header="Email" />
          <Column field="points" header="Points" />
          <Column body={roleBody} header="Role" />
          <Column
            field="createdAt"
            header="Joined"
            body={(row) => new Date(row.createdAt).toLocaleDateString()}
          />
          <Column body={actions} header="Actions" />
        </DataTable>
      </section>

      <Dialog
        header={`Edit Points: ${selectedUser?.username}`}
        visible={dialogOpen}
        onHide={() => setDialogOpen(false)}
        modal
        style={{ width: '400px' }}
      >
        <div className="form-stack">
          <label>
            Points
            <InputNumber
              value={newPoints}
              onValueChange={(e) => setNewPoints(e.value)}
              min={0}
              showButtons
              style={{ width: '100%' }}
            />
          </label>
          <Button label="Save" icon="pi pi-save" onClick={save} />
        </div>
      </Dialog>
    </>
  );
}
