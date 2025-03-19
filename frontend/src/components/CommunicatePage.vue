<template>
  <div class="communicate-page">
    <HeaderComponent />

    <div class="content-container">
      <!-- Left Sidebar: Search & Contacts -->
      <div class="left-sidebar">
        <input type="text" placeholder="Search" class="search-bar" />
        <button class="add-new" @click="openModal">+ Add New</button>

        <div class="contacts">
          <div class="contact" v-for="contact in contacts" :key="contact.customerId" @click="selectCustomer(contact)"
            :class="{ 'active': selectedCustomer && selectedCustomer.customerId === contact.customerId }">
            <img :src="contact.profilePicture || defaultAvatar" alt="Avatar" class="contact-avatar" />
            <span class="contact-name">{{ contact.name }}</span>
            <button class="delete-btn" @click.stop="confirmDeleteCustomer(contact)">×</button>
          </div>
        </div>
      </div>

      <!-- Customer Details Panel with Vertical Tabs -->
      <div v-if="selectedCustomer" class="customer-details-panel">
        <div class="panel-layout">
          <!-- Vertical Tabs Navigation on Left -->
          <div class="tabs-navigation vertical">
            <div class="tab" @click="activeTab = 'information'" :class="{ active: activeTab === 'information' }">
              Information
            </div>
            <div class="tab" @click="activeTab = 'tasks'" :class="{ active: activeTab === 'tasks' }">
              Tasks
            </div>
          </div>

          <!-- Tab Content -->
          <div class="tab-content-container">
            <div class="tab-content">
              <!-- Information Tab -->
              <div v-if="activeTab === 'information'" class="info-tab">
                <h2>Customer Information</h2>
                <form @submit.prevent="updateCustomerInfo">
                  <div class="form-group">
                    <label>Profile Picture</label>
                    <div class="profile-preview">
                      <img :src="editableCustomer.profilePicture || defaultAvatar" alt="Profile" class="profile-img" />
                      <input type="file" @change="updateProfilePicture" />
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Name</label>
                    <input type="text" v-model="editableCustomer.name" required />
                  </div>
                  <div class="form-group">
                    <label>Company</label>
                    <input type="text" v-model="editableCustomer.companyName" />
                  </div>
                  <div class="form-group">
                    <label>Email</label>
                    <input type="email" v-model="editableCustomer.email" required />
                  </div>
                  <div class="form-group">
                    <label>Phone</label>
                    <input type="text" v-model="editableCustomer.phone" required />
                  </div>
                  <div class="form-group">
                    <label>Address</label>
                    <input type="text" v-model="editableCustomer.address" />
                  </div>
                  <div class="form-group">
                    <label>Notes</label>
                    <textarea v-model="editableCustomer.information.notes" rows="4"></textarea>
                  </div>
                  <button type="submit" class="save-button">Save Changes</button>
                </form>
              </div>

              <!-- Tasks Tab -->
              <div v-else-if="activeTab === 'tasks'" class="tasks-tab">
                <h2>Tasks</h2>
                <div class="tasks-container">
                  <div v-if="!editableCustomer.tasks || editableCustomer.tasks.length === 0" class="no-tasks">
                    No tasks yet.
                  </div>
                  <div v-else class="task-list">
                    <div v-for="(task, idx) in editableCustomer.tasks" :key="idx" class="task">
                      <input type="checkbox" v-model="task.completed" @change="updateTasks" />
                      <span :class="{ 'completed': task.completed }">{{ task.title }}</span>
                      <span class="due-date">{{ formatDate(task.dueDate) }}</span>
                      <button @click="deleteTask(idx)" class="delete-button">×</button>
                    </div>
                  </div>
                </div>
                <div class="new-task">
                  <input type="text" v-model="newTaskTitle" placeholder="Task title" />
                  <input type="date" v-model="newTaskDueDate" />
                  <button @click="addTask" class="add-button">Add Task</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State when no customer is selected -->
      <div v-else class="empty-state">
        <div class="empty-content">
          <img :src="defaultAvatar" alt="Empty state" class="empty-icon" />
          <h2>Select a customer to view details</h2>
          <p>Click on a customer from the left sidebar to view their information and tasks.</p>
        </div>
      </div>

      <!-- Right Sidebar: Team Members and Assigned Users -->
      <div class="right-sidebar">
        <h2>Team Members</h2>
        <div class="team-members">
          <div class="team-member" v-for="member in team" :key="member.id" @click="toggleAssignUser(member)"
            :class="{ 'assigned': isUserAssigned(member.id) }">
            <img :src="member.avatar" alt="Avatar" class="team-avatar" />
            <span class="team-name">{{ member.name }}</span>
            <span v-if="isUserAssigned(member.id)" class="assigned-badge">✓</span>
          </div>
          <button class="add-new">+ Add Team Member</button>
        </div>
      </div>
    </div>

    <!-- MODAL FOR ADDING CONTACT -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h2>Add a New Contact</h2>
        <form @submit.prevent="saveContact">
          <div class="form-group">
            <label>Profile Picture</label>
            <input type="file" @change="uploadImage" />
          </div>
          <div class="form-group">
            <label>Name</label>
            <input type="text" v-model="newContact.name" required />
          </div>
          <div class="form-group">
            <label>Address</label>
            <input type="text" v-model="newContact.address" required />
          </div>
          <div class="form-group">
            <label>Company</label>
            <input type="text" v-model="newContact.companyName" />
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input type="text" v-model="newContact.phone" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="newContact.email" required />
          </div>
          <button type="submit" :disabled="loading">{{ loading ? 'Creating...' : 'Create' }}</button>
          <button type="button" @click="closeModal">Cancel</button>
        </form>
      </div>
    </div>

    <!-- MODAL FOR CONFIRMING DELETION -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal small-modal">
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to delete customer "{{ customerToDelete?.name }}"?</p>
        <div class="button-group">
          <button @click="deleteCustomer" class="delete-button">Delete</button>
          <button @click="cancelDelete" class="cancel-button">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderComponent from "@/components/HeaderComponent.vue";
import {
  getCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  updateTasks,
  updateNotes,
  updateAssignedUsers,
  deleteCustomer
} from "@/services/apiService";

export default {
  name: "CommunicatePage",
  components: {
    HeaderComponent,
  },
  data() {
    return {
      showModal: false,
      showDeleteModal: false,
      customerToDelete: null,
      contacts: [],
      selectedCustomer: null,
      editableCustomer: null,
      activeTab: 'information',
      team: [
        { id: 1, name: "Sean Foster", avatar: require('@/assets/user.png') },
        { id: 2, name: "Jane Doe", avatar: require('@/assets/user.png') },
        { id: 3, name: "John Smith", avatar: require('@/assets/user.png') },
      ],
      newContact: {
        name: "",
        address: "",
        companyName: "",
        phone: "",
        email: "",
        profilePicture: null,
      },
      newTaskTitle: "",
      newTaskDueDate: "",
      defaultAvatar: require('@/assets/logo.png'),
      loading: false,
      error: null
    };
  },
  methods: {
    async fetchContacts() {
      try {
        this.loading = true;
        this.contacts = await getCustomers();
        this.loading = false;
      } catch (error) {
        this.error = error.message || "Error fetching contacts";
        console.error("Error fetching contacts:", error);
        this.loading = false;
      }
    },

    async selectCustomer(customer) {
      try {
        this.loading = true;
        const fullCustomer = await getCustomerById(customer.customerId);

        // Ensure the customer has the expected structure by providing defaults
        const customerWithDefaults = {
          ...fullCustomer,
          // Ensure information contains notes
          information: fullCustomer.information || { notes: "" },
          // Ensure tasks is an array
          tasks: fullCustomer.tasks || [],
          // Ensure assignedUsers is an array
          assignedUsers: fullCustomer.assignedUsers || []
        };

        this.selectedCustomer = customerWithDefaults;
        this.editableCustomer = JSON.parse(JSON.stringify(customerWithDefaults)); // Deep clone
        this.activeTab = 'information';
        this.loading = false;
      } catch (error) {
        this.error = error.message || "Error fetching customer details";
        console.error("Error selecting customer:", error);
        this.loading = false;
      }
    },

    formatDate(dateString) {
      if (!dateString) return '';

      const date = new Date(dateString);
      return date.toLocaleString();
    },

    openModal() {
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.resetContactForm();
    },

    confirmDeleteCustomer(customer) {
      this.customerToDelete = customer;
      this.showDeleteModal = true;
    },

    cancelDelete() {
      this.customerToDelete = null;
      this.showDeleteModal = false;
    },

    async deleteCustomer() {
      if (!this.customerToDelete) return;

      try {
        this.loading = true;
        const result = await deleteCustomer(this.customerToDelete.customerId);

        if (result.success) {
          // Remove from contacts list
          this.contacts = this.contacts.filter(
            c => c.customerId !== this.customerToDelete.customerId
          );

          // If this was the selected customer, clear selection
          if (this.selectedCustomer &&
            this.selectedCustomer.customerId === this.customerToDelete.customerId) {
            this.selectedCustomer = null;
            this.editableCustomer = null;
          }

          alert("Customer deleted successfully!");
        }

        this.loading = false;
        this.showDeleteModal = false;
        this.customerToDelete = null;
      } catch (error) {
        this.error = error.message || "Error deleting customer";
        console.error("Error deleting customer:", error);
        this.loading = false;
        alert("Failed to delete customer. Please try again.");
      }
    },

    async saveContact() {
      try {
        this.loading = true;

        if (!this.newContact.name || !this.newContact.phone || !this.newContact.email) {
          alert("Please fill in all required fields.");
          this.loading = false;
          return;
        }

        const result = await createCustomer({
          name: this.newContact.name,
          address: this.newContact.address,
          companyName: this.newContact.companyName,
          phone: this.newContact.phone,
          email: this.newContact.email,
          profilePicture: this.newContact.profilePicture
        });

        if (result.success) {
          this.contacts.push(result.customer);
          this.showModal = false;
          this.resetContactForm();
        }

        this.loading = false;
      } catch (error) {
        this.error = error.message || "Error saving customer";
        console.error("Error saving customer:", error);
        this.loading = false;
      }
    },

    async updateCustomerInfo() {
      try {
        this.loading = true;

        // Update customer basic info without profile picture
        const updates = {
          name: this.editableCustomer.name,
          companyName: this.editableCustomer.companyName,
          email: this.editableCustomer.email,
          phone: this.editableCustomer.phone,
          address: this.editableCustomer.address
          // Removed profilePicture
        };

        const result = await updateCustomer(this.selectedCustomer.customerId, updates);

        // Update notes separately
        if (this.editableCustomer.information && this.editableCustomer.information.notes) {
          await updateNotes(this.selectedCustomer.customerId, this.editableCustomer.information.notes);
        }

        if (result.success) {
          // Refetch the customer to get the latest data
          const updatedCustomer = await getCustomerById(this.selectedCustomer.customerId);
          this.selectedCustomer = updatedCustomer;
          this.editableCustomer = JSON.parse(JSON.stringify(updatedCustomer));

          // Update customer in contacts list
          const index = this.contacts.findIndex(c => c.customerId === result.customer.customerId);
          if (index !== -1) {
            this.contacts[index] = {
              ...this.contacts[index],
              name: result.customer.name,
              email: result.customer.email,
              phone: result.customer.phone
            };
          }

          alert("Customer information updated successfully!");
        }

        this.loading = false;
      } catch (error) {
        this.error = error.message || "Error updating customer";
        console.error("Error updating customer:", error);
        this.loading = false;
        alert(`Failed to update customer: ${error.message}`);
      }
    },

    // For profile picture update
    updateProfilePicture() {
      // Disable profile picture uploads due to payload size limits
      alert("Profile picture uploads are temporarily disabled due to server limitations.");
    },

    async addTask() {
      if (!this.newTaskTitle.trim()) {
        alert("Please enter a task title.");
        return;
      }

      try {
        this.loading = true;

        // Ensure tasks is an array
        if (!Array.isArray(this.editableCustomer.tasks)) {
          this.editableCustomer.tasks = [];
        }

        // Clone the current tasks array
        const tasks = [...this.editableCustomer.tasks];

        // Add the new task
        tasks.push({
          title: this.newTaskTitle,
          dueDate: this.newTaskDueDate || new Date().toISOString(),
          completed: false,
          createdAt: new Date().toISOString()
        });

        // Update the tasks
        const result = await updateTasks(
          this.selectedCustomer.customerId,
          tasks
        );

        if (result.success) {
          // Update local state
          this.selectedCustomer = result.customer;
          this.editableCustomer = JSON.parse(JSON.stringify(result.customer));

          // Clear the inputs
          this.newTaskTitle = "";
          this.newTaskDueDate = "";
        }

        this.loading = false;
      } catch (error) {
        console.error("Error adding task:", error);
        alert("Failed to add task. Please try again.");
        this.loading = false;
      }
    },

    async updateTasks() {
      try {
        this.loading = true;

        const tasks = [...this.editableCustomer.tasks];

        // Update tasks
        const result = await updateTasks(
          this.selectedCustomer.customerId,
          tasks
        );

        if (result.success) {
          // Update local state
          this.selectedCustomer = result.customer;
          this.editableCustomer = JSON.parse(JSON.stringify(result.customer));
        }

        this.loading = false;
      } catch (error) {
        console.error("Error updating tasks:", error);
        alert("Failed to update tasks. Please try again.");
        this.loading = false;
      }
    },

    async deleteTask(index) {
      try {
        this.loading = true;

        // Clone and modify the tasks array
        const tasks = [...this.editableCustomer.tasks];
        tasks.splice(index, 1);

        // Update tasks
        const result = await updateTasks(
          this.selectedCustomer.customerId,
          tasks
        );

        if (result.success) {
          // Update local state
          this.selectedCustomer = result.customer;
          this.editableCustomer = JSON.parse(JSON.stringify(result.customer));
        }

        this.loading = false;
      } catch (error) {
        console.error("Error deleting task:", error);
        alert("Failed to delete task. Please try again.");
        this.loading = false;
      }
    },

    isUserAssigned(userId) {
      if (!this.selectedCustomer || !this.selectedCustomer.assignedUsers) return false;
      return this.selectedCustomer.assignedUsers.includes(userId);
    },

    async toggleAssignUser(user) {
      if (!this.selectedCustomer) return;

      try {
        this.loading = true;

        // Clone the current assignedUsers array
        let assignedUsers = [...(this.selectedCustomer.assignedUsers || [])];

        // Toggle the user's assigned status
        if (this.isUserAssigned(user.id)) {
          assignedUsers = assignedUsers.filter(id => id !== user.id);
        } else {
          assignedUsers.push(user.id);
        }

        // Update the assigned users
        const result = await updateAssignedUsers(
          this.selectedCustomer.customerId,
          assignedUsers
        );

        if (result.success) {
          // Update local state
          this.selectedCustomer.assignedUsers = assignedUsers;
          this.editableCustomer.assignedUsers = assignedUsers;
        }

        this.loading = false;
      } catch (error) {
        console.error("Error updating assigned users:", error);
        alert("Failed to update assigned users. Please try again.");
        this.loading = false;
      }
    },

    uploadImage() {
      // Disable profile picture uploads due to payload size limits
      this.newContact.profilePicture = null;
      alert("Profile picture uploads are temporarily disabled due to server limitations.");
    },

    resetContactForm() {
      this.newContact = {
        name: "",
        address: "",
        companyName: "",
        phone: "",
        email: "",
        profilePicture: null,
      };
    },
  },
  mounted() {
    this.fetchContacts();
  },
};
</script>

<style scoped>
body {
  overflow: hidden;
}

/* Full-page container */
.communicate-page {
  width: 100%;
  height: calc(100vh - 80px);
  background-color: #2B2D31;
  display: flex;
  flex-direction: column;
  margin-top: 40px;
  overflow: hidden;
}

.content-container {
  display: flex;
  width: 100%;
  height: 100%;
}

/* Left Sidebar: Search & Contacts */
.left-sidebar {
  flex: 1;
  background-color: #1E1F22;
  padding: 16px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #232428;
  overflow-y: auto;
}

.search-bar {
  width: 100%;
  padding: 0px;
  padding-top: 6px;
  padding-bottom: 6px;
  border-radius: 4px;
  border: none;
  background-color: #2B2D31;
  color: white;
  text-align: center;
}

.add-new {
  background-color: #5865F2;
  color: white;
  padding: 6px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  margin-top: 8px;
  width: 100%;
}

.contacts {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.contact {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.contact:hover {
  background-color: #2E3035;
}

.contact.active {
  background-color: #404249;
}

.contact-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.contact-name {
  flex-grow: 1;
}

.delete-btn {
  visibility: hidden;
  background: none;
  border: none;
  color: #FF5555;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  padding: 0 5px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.contact:hover .delete-btn {
  visibility: visible;
}

.delete-btn:hover {
  opacity: 1;
}

/* Customer Details Panel */
.customer-details-panel {
  flex: 6;
  display: flex;
  flex-direction: column;
  background-color: #36393F;
  color: white;
  height: 100%;
}

.panel-layout {
  display: flex;
  height: 100%;
}

/* Tabs Navigation - Vertical */
.tabs-navigation.vertical {
  display: flex;
  flex-direction: column;
  width: 200px;
  background-color: #2E3035;
  height: 100%;
  overflow-y: auto;
}

.tabs-navigation.vertical .tab {
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-left: 3px solid transparent;
}

.tabs-navigation.vertical .tab:hover {
  background-color: #36393F;
}

.tabs-navigation.vertical .tab.active {
  background-color: #36393F;
  border-left: 3px solid #5865F2;
  font-weight: 500;
}

/* Tab Content */
.tab-content-container {
  flex: 1;
  overflow-y: auto;
}

.tab-content {
  padding: 20px;
}

/* Information Tab */
.info-tab {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  color: #B9BBBE;
}

.form-group input,
.form-group textarea {
  padding: 10px;
  border-radius: 4px;
  border: none;
  background-color: #2E3035;
  color: white;
  resize: vertical;
}

.save-button {
  background-color: #5865F2;
  color: white;
  padding: 10px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  margin-top: 16px;
  font-weight: bold;
}

.profile-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.profile-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

/* Tasks Tab */
.tasks-container {
  margin-bottom: 16px;
}

.no-tasks {
  color: #B9BBBE;
  font-style: italic;
  padding: 20px;
  text-align: center;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background-color: #2E3035;
  border-radius: 4px;
}

.task input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.task .completed {
  text-decoration: line-through;
  color: #B9BBBE;
}

.due-date {
  margin-left: auto;
  font-size: 12px;
  color: #B9BBBE;
}

.delete-button {
  background: none;
  border: none;
  color: #B9BBBE;
  font-size: 18px;
  cursor: pointer;
  padding: 0 5px;
}

.delete-button:hover {
  color: #FF5555;
}

.new-task {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.new-task input {
  padding: 10px;
  border-radius: 4px;
  border: none;
  background-color: #2E3035;
  color: white;
}

.new-task input[type="text"] {
  flex: 1;
}

.add-button {
  background-color: #5865F2;
  color: white;
  padding: 10px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

/* Empty State */
.empty-state {
  flex: 6;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #36393F;
  color: white;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  padding: 40px;
  max-width: 500px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  opacity: 0.5;
}

.empty-content h2 {
  margin: 0;
  font-size: 24px;
}

.empty-content p {
  color: #B9BBBE;
  margin: 0;
}

/* Right Sidebar: Team Members */
.right-sidebar {
  flex: 1.5;
  background-color: #1E1F22;
  padding: 16px;
  color: white;
  border-left: 1px solid #232428;
  overflow-y: auto;
}

.right-sidebar h2 {
  font-size: 18px;
  margin-bottom: 16px;
}

.team-members {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.team-member {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.team-member:hover {
  background-color: #2E3035;
}

.team-member.assigned {
  background-color: #3b4046;
}

.team-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.assigned-badge {
  position: absolute;
  right: 10px;
  background-color: #5865F2;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal {
  background: #1E1F22;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  color: white;
}

.small-modal {
  width: 300px;
}

.modal h2 {
  margin-bottom: 15px;
  font-size: 18px;
  text-align: center;
  color: #F2F3F5;
}

.modal p {
  margin-bottom: 20px;
  text-align: center;
}

.modal input,
.modal select,
.modal textarea {
  box-sizing: border-box; /* This is the key property */
  padding: 10px 10px; /* Top/bottom and left/right padding */
  border-radius: 4px;
  border: none;
  background-color: #2B2D31;
  color: white;
  width: 100%;
}

.modal input[type="file"] {
  background-color: transparent;
}

.modal button {
  margin-top: 10px;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: 0.2s ease-in-out;
  width: 100%;
}

.modal button[type="submit"],
.modal button[type="button"]:first-of-type {
  background-color: #5865F2;
  color: white;
}

.modal button[type="submit"]:hover,
.modal button[type="button"]:first-of-type:hover {
  background-color: #4752C4;
}

.modal button[type="button"]:last-of-type {
  background-color: #3C3F44;
  color: #F2F3F5;
}

.modal button[type="button"]:last-of-type:hover {
  background-color: #4A4D54;
}

.modal button:disabled {
  background-color: #3C3F44;
  cursor: not-allowed;
  opacity: 0.7;
}

.button-group {
  display: flex;
  gap: 10px;
}

.button-group button {
  flex: 1;
}

.delete-button {
  background-color: #ED4245 !important;
}

.delete-button:hover {
  background-color: #FF5555 !important;
}

.cancel-button {
  background-color: #3C3F44 !important;
}
</style>