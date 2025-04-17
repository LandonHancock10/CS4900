<template>
  <div class="communicate-page">
    <HeaderComponent />

    <div class="content-container" :class="{ 'mobile-view': isMobile }">
      <!-- Left Sidebar: Search & Contacts -->
      <div class="left-sidebar" :class="{ 'mobile-sidebar': isMobile, 'show': showLeftSidebar }"
        v-if="!isMobile || showLeftSidebar">
        <div v-if="isMobile" class="mobile-sidebar-header">
        </div>

        <input type="text" placeholder="Search" class="search-bar" />
        <button class="add-new" @click="openModal">+ Add New</button>

        <div class="contacts">
          <div class="contact" v-for="contact in contacts" :key="contact.customerId"
            @click="selectCustomer(contact); isMobile && toggleLeftSidebar(); showWorkPage = false;"
            :class="{ 'active': selectedCustomer && selectedCustomer.customerId === contact.customerId && !showWorkPage, 'left-indicator': true }">
            <img :src="contact.profilePicture || defaultAvatar" alt="Avatar" class="contact-avatar" />
            <span class="contact-name">{{ contact.name }}</span>
            <button class="delete-btn" @click.stop="confirmDeleteCustomer(contact)">×</button>
          </div>
        </div>
      </div>

      <!-- Customer Details Panel -->
      <div v-if="selectedCustomer && !showWorkPage" class="customer-details-panel" :class="{ 'mobile-main': isMobile }">
        <!-- Mobile sidebar triggers within customer panel -->
        <div class="mobile-sidebar-triggers" v-if="isMobile">
          <span class="trigger-left" @click="toggleLeftSidebar">← Contacts</span>
          <span class="trigger-right" @click="toggleRightSidebar">Assigned Users →</span>
        </div>

        <div class="panel-layout no-tabs">
          <div class="tab-content-container">
            <div class="tab-content">
              <!-- Customer Information -->
              <div class="info-tab">
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
                    <textarea v-model="editableCustomer.notes" rows="4"></textarea>
                  </div>
                  <button type="submit" class="save-button">Save Changes</button>
                </form>
              </div>

              <!-- Tasks Section -->
              <div class="tasks-tab" style="margin-top: 32px;">
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
                <div class="new-task" :class="{ 'mobile-new-task': isMobile }">
                  <input type="text" v-model="newTaskTitle" placeholder="Task title" />
                  <input type="date" v-model="newTaskDueDate" />
                  <button @click="addTask" class="add-button">Add Task</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Work Page (All Tasks View) -->
      <div v-if="showWorkPage" class="customer-details-panel work-page" :class="{ 'mobile-main': isMobile }">
        <!-- Mobile sidebar triggers within work panel -->
        <div class="mobile-sidebar-triggers" v-if="isMobile">
          <span class="trigger-left" @click="toggleLeftSidebar">← Contacts</span>
          <span class="trigger-right" @click="toggleRightSidebar">Assigned Users →</span>
        </div>

        <div class="panel-layout no-tabs">
          <div class="tab-content-container">
            <div class="tab-content">
              <div class="info-tab">
                <div class="work-page-header">
                  <h2>My Assigned Tasks</h2>
                  <div class="filter-controls">
                    <label class="checkbox-container">
                      <input type="checkbox" v-model="showCompletedTasks">
                      <span class="checkmark"></span>
                      Show Completed
                    </label>
                  </div>
                </div>

                <div class="tasks-container all-tasks">
                  <div v-if="assignedTasks.length === 0" class="no-tasks">
                    No tasks assigned to you yet.
                  </div>
                  <div v-else class="task-list">
                    <!-- Use v-for with key that includes both index and task identity -->
                    <div v-for="(task, idx) in filteredAssignedTasks"
                      :key="`${task.customerId}-${task.originalIndex}-${idx}`" class="task all-task">
                      <!-- Bind :checked directly rather than using v-model -->
                      <input type="checkbox" :checked="task.completed" @change="updateTaskCompletion(task, $event)" />
                      <div class="task-details">
                        <span :class="{ 'completed': task.completed }">{{ task.title }}</span>
                        <span class="task-customer">{{ task.customerName }}</span>
                      </div>
                      <span class="due-date">{{ formatDate(task.dueDate) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State when no customer is selected -->
      <div v-if="!selectedCustomer && !showWorkPage" class="empty-state" :class="{ 'mobile-main': isMobile }">
        <div class="empty-content">
          <img :src="defaultAvatar" alt="Empty state" class="empty-icon" />
          <h2>Select a customer to view details</h2>
          <p>Click on a customer from the left sidebar to view their information and tasks.</p>
        </div>
      </div>

      <!-- Right Sidebar: Team Members and Assigned Users -->
      <div class="right-sidebar" :class="{ 'mobile-sidebar': isMobile, 'show': showRightSidebar }"
        v-if="!isMobile || showRightSidebar">
        <h2>Team Members</h2>

        <!-- View Assigned Tasks Button -->
        <button class="add-new view-tasks-btn" @click="toggleWorkPage">
          {{ showWorkPage ? 'Back to Customer View' : 'View Assigned Tasks' }}
        </button>

        <!-- Assign Self Button (only show when not in work page) -->
        <button v-if="selectedCustomer && !showWorkPage" class="add-new" style="margin-top: 8px;"
          @click="assignSelfToCustomer">
          Assign Self to Contact
        </button>

        <!-- Assigned Users List -->
        <div class="contacts" style="margin-top: 12px;">
          <div class="contact right-indicator" v-for="member in assignedUsersDetails" :key="member.id">
            <img :src="member.avatar || defaultAvatar" alt="Avatar" class="contact-avatar" />
            <span class="contact-name">{{ member.name }}</span>

            <!-- Remove Assigned User Button -->
            <button class="delete-btn" @click.stop="removeAssignedUser(member.id)">×</button>
          </div>
        </div>
      </div>

      <!-- Overlay when mobile sidebar is open -->
      <div v-if="isMobile && (showLeftSidebar || showRightSidebar)" class="mobile-overlay" @click="closeAllSidebars">
      </div>
    </div>

    <!-- MODAL FOR ADDING CONTACT -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal" :class="{ 'mobile-modal': isMobile }">
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
      <div class="modal small-modal" :class="{ 'mobile-modal': isMobile }">
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
  deleteCustomer,
  uploadCustomerProfilePicture,
  getAllUsers
} from "@/services/apiService";

export default {
  name: "CommunicatePage",
  components: {
    HeaderComponent,
  },
  data() {
    return {
      showModal: false,
      allUsers: [],
      showDeleteModal: false,
      customerToDelete: null,
      contacts: [],
      selectedCustomer: null,
      editableCustomer: null,
      activeTab: 'information',
      team: [],
      windowWidth: window.innerWidth,
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
      error: null,
      showLeftSidebar: false,
      showRightSidebar: false,
      // New Work Page related data
      showWorkPage: false,
      showCompletedTasks: false,
      assignedTasks: [],
    };
  },
  computed: {
    assignedUsersDetails() {
      if (!this.selectedCustomer || !this.selectedCustomer.assignedUsers) return [];
      return this.team.filter(user => this.selectedCustomer.assignedUsers.includes(user.id));
    },
    isMobile() {
      return this.windowWidth <= 768;
    },

    filteredAssignedTasks() {
      // Always filter based on completion status, even during loading
      return this.showCompletedTasks
        ? this.assignedTasks
        : this.assignedTasks.filter(task => !task.completed);
    },
  },
  methods: {
    async fetchContacts() {
      try {
        this.loading = true;
        this.contacts = await getCustomers();

        // Auto-select the first contact if any exist
        if (this.contacts.length > 0) {
          this.selectCustomer(this.contacts[0]);
        }

        this.loading = false;
      } catch (error) {
        this.error = error.message || "Error fetching contacts";
        console.error("Error fetching contacts:", error);
        this.loading = false;
      }
    },

    updateTaskCompletion(task, event) {
      // Get the new completion state from the checkbox event
      const isCompleted = event.target.checked;

      // Create a deep copy of the task to avoid reference issues
      const taskToUpdate = JSON.parse(JSON.stringify(task));
      taskToUpdate.completed = isCompleted;

      // Call the existing method with the updated task
      this.updateCustomerTask(taskToUpdate);
    },

    toggleLeftSidebar() {
      this.showLeftSidebar = !this.showLeftSidebar;
    },
    toggleRightSidebar() {
      this.showRightSidebar = !this.showRightSidebar;
    },
    closeAllSidebars() {
      this.showLeftSidebar = false;
      this.showRightSidebar = false;
    },

    handleResize() {
      this.windowWidth = window.innerWidth;
    },

    // Toggle between customer view and work page
    toggleWorkPage() {
      this.showWorkPage = !this.showWorkPage;

      if (this.showWorkPage) {
        this.fetchAssignedTasks();
      }
    },

    // Fetch all tasks from customers assigned to the current user
    async fetchAssignedTasks() {
      try {
        this.loading = true;

        // Get current user ID from token
        const token = localStorage.getItem("token");
        if (!token) {
          alert("You must be logged in to view assigned tasks.");
          this.loading = false;
          return;
        }

        const payload = JSON.parse(atob(token.split(".")[1]));
        const userId = String(payload.userId);

        // Array to store all assigned tasks
        this.assignedTasks = [];

        // Get all customers
        const allCustomers = await getCustomers();

        // Filter customers assigned to the current user
        const assignedCustomers = allCustomers.filter(customer => {
          if (!customer.assignedUsers) return false;

          // Normalize assignedUsers to handle different formats
          const assignedUsers = Array.isArray(customer.assignedUsers)
            ? customer.assignedUsers.map(id => typeof id === "object" && id.S ? id.S : String(id))
            : [];

          return assignedUsers.includes(userId);
        });

        // For each assigned customer, get their full details including tasks
        for (const customer of assignedCustomers) {
          const fullCustomer = await getCustomerById(customer.customerId);

          // If customer has tasks, add them to assignedTasks with customer info
          if (fullCustomer.tasks && fullCustomer.tasks.length > 0) {
            const customerTasks = fullCustomer.tasks.map(task => ({
              ...task,
              customerId: fullCustomer.customerId,
              customerName: fullCustomer.name,
              originalIndex: fullCustomer.tasks.indexOf(task)
            }));

            this.assignedTasks = [...this.assignedTasks, ...customerTasks];
          }
        }

        // Sort tasks by due date
        this.assignedTasks.sort((a, b) => {
          const dateA = new Date(a.dueDate || 0);
          const dateB = new Date(b.dueDate || 0);
          return dateA - dateB;
        });

        this.loading = false;
      } catch (error) {
        console.error("Error fetching assigned tasks:", error);
        this.loading = false;
        alert("Failed to load assigned tasks. Please try again.");
      }
    },

    async updateCustomerTask(task) {
      try {
        // Store the completed state we're going to set
        const newCompletedState = task.completed;

        // Find the customer this task belongs to
        const customerId = task.customerId;
        if (!customerId) {
          console.error("Task is missing customer ID");
          return;
        }

        // Create a copy of the tasks array and update the specific task
        const taskIndex = this.assignedTasks.findIndex(t =>
          t.customerId === task.customerId && t.originalIndex === task.originalIndex
        );

        if (taskIndex !== -1) {
          // Create a new array with updated tasks to ensure proper reactivity
          const updatedTasks = this.assignedTasks.map((t, index) => {
            if (index === taskIndex) {
              // Create a new object for the task being updated
              return { ...t, completed: newCompletedState };
            }
            // Return other tasks unchanged
            return t;
          });

          // Replace the tasks array with our new one
          this.assignedTasks = updatedTasks;
        }

        // Update the server without setting global loading state
        const customer = await getCustomerById(customerId);

        if (customer.tasks && customer.tasks.length > 0 && task.originalIndex !== undefined) {
          customer.tasks[task.originalIndex].completed = newCompletedState;

          // Save the updated tasks
          const result = await updateTasks(customerId, customer.tasks);

          if (!result.success) {
            console.error("Task update failed on server");
            // Revert the local change if server update failed
            if (taskIndex !== -1) {
              this.assignedTasks = this.assignedTasks.map((t, index) => {
                if (index === taskIndex) {
                  return { ...t, completed: !newCompletedState };
                }
                return t;
              });
            }
          }

          // If the currently selected customer is the one we just updated,
          // refresh their data to show the changes
          if (this.selectedCustomer && this.selectedCustomer.customerId === customerId) {
            this.selectCustomer({ customerId: customerId });
          }
        }
      } catch (error) {
        console.error("Error updating task:", error);
        alert("Failed to update task. Please try again.");
      }
    },

    assignSelfToCustomer() {
      const token = localStorage.getItem("token");
      if (!token) return alert("You must be logged in.");

      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = String(payload.userId); // Ensure it's a string

      if (!this.selectedCustomer || !userId) return;

      const assigned = this.editableCustomer.assignedUsers.map(String);
      if (!assigned.includes(userId)) {
        this.editableCustomer.assignedUsers.push(userId);
        this.updateAssignedUsers();
      }
    },

    removeAssignedUser(userId) {
      if (!this.selectedCustomer) return;

      console.log("Removing user ID from assigned list:", userId);

      // Normalize and filter
      const filtered = this.editableCustomer.assignedUsers
        .map(id => (typeof id === "object" && id.S ? id.S : String(id)))
        .filter(id => id !== String(userId));

      // Trigger Vue reactivity by creating new arrays
      this.selectedCustomer = {
        ...this.selectedCustomer,
        assignedUsers: filtered
      };

      this.editableCustomer = {
        ...this.editableCustomer,
        assignedUsers: filtered
      };

      this.updateAssignedUsers();
    },

    async updateAssignedUsers() {
      try {
        const cleanUserIds = this.editableCustomer.assignedUsers.map(String); // Normalize all IDs
        const result = await updateAssignedUsers(this.selectedCustomer.customerId, cleanUserIds);

        if (result.success) {
          // Ensure both are updated so UI reflects correctly
          this.selectedCustomer.assignedUsers = [...cleanUserIds];
          this.editableCustomer.assignedUsers = [...cleanUserIds];
        }
      } catch (error) {
        console.error("Failed to update assigned users:", error);
      }
    },

    async fetchAllUsers() {
      try {
        const users = await getAllUsers();

        // Normalize the structure to match what the template expects
        this.team = users.map(u => ({
          id: u.userId,
          name: `${u.firstName} ${u.lastName}`,
          avatar: u.profilePicture || null
        }));

        console.log("TEAM DATA Normalized:", this.team);
      } catch (error) {
        console.error("Failed to fetch all users:", error);
      }
    },

    async selectCustomer(customer) {
      try {
        this.loading = true;
        const fullCustomer = await getCustomerById(customer.customerId);

        const customerWithDefaults = {
          ...fullCustomer,
          notes: fullCustomer.notes || "",
          tasks: fullCustomer.tasks || [],
          assignedUsers: this.normalizeAssignedUsers(fullCustomer.assignedUsers || [])
        };

        this.selectedCustomer = customerWithDefaults;
        this.editableCustomer = JSON.parse(JSON.stringify(customerWithDefaults));
        this.activeTab = 'information';
        this.loading = false;
        console.log("assignedUsers RAW:", fullCustomer.assignedUsers);
      } catch (error) {
        this.error = error.message || "Error fetching customer details";
        console.error("Error selecting customer:", error);
        this.loading = false;
      }
    },

    normalizeAssignedUsers(assignedUsers) {
      console.log("Normalizing assignedUsers:", assignedUsers);

      if (!Array.isArray(assignedUsers)) return [];

      // Handle array of { S: "uuid" } objects
      if (assignedUsers.length && typeof assignedUsers[0] === "object" && assignedUsers[0].S) {
        return assignedUsers.map(u => u.S);
      }

      return assignedUsers; // Already normalized
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

        console.log("Creating new customer with data:", {
          ...this.newContact,
          profilePicture: this.newContact.profilePicture ?
            `${this.newContact.profilePicture.substring(0, 30)}... (length: ${this.newContact.profilePicture.length})` :
            null
        });

        // Check if we have a profile picture
        if (this.newContact.profilePicture) {
          console.log("Profile picture included in request, length:", this.newContact.profilePicture.length);
        } else {
          console.log("No profile picture included in request");
        }

        const result = await createCustomer({
          name: this.newContact.name,
          address: this.newContact.address,
          companyName: this.newContact.companyName,
          phone: this.newContact.phone,
          email: this.newContact.email,
          profilePicture: this.newContact.profilePicture
        });

        console.log("Customer creation result:", result);

        if (result.success) {
          console.log("Customer created successfully:", result.customer);

          // If we have a customer ID and profile picture, but the customer in the response doesn't have a profile picture,
          // we need to upload it separately
          if (result.customer.customerId && this.newContact.profilePicture && !result.customer.profilePicture) {
            try {
              console.log("Customer created without profile picture, uploading separately...");
              const uploadResponse = await uploadCustomerProfilePicture(
                result.customer.customerId,
                this.newContact.profilePicture
              );
              console.log("Profile picture upload response:", uploadResponse);

              if (uploadResponse.success) {
                result.customer.profilePicture = uploadResponse.profilePictureUrl;
              }
            } catch (uploadError) {
              console.error("Error uploading profile picture:", uploadError);
            }
          }

          this.contacts.push(result.customer);
          this.showModal = false;
          this.resetContactForm();
        } else {
          console.error("Customer creation failed:", result);
          alert(result.message || "Error creating customer");
        }

        this.loading = false;
      } catch (error) {
        console.error("Error saving customer:", error);
        alert(error.message || "Error creating customer");
        this.loading = false;
      }
    },

    async updateCustomerInfo() {
      try {
        this.loading = true;

        // Update customer basic info
        const updates = {
          name: this.editableCustomer.name,
          companyName: this.editableCustomer.companyName,
          email: this.editableCustomer.email,
          phone: this.editableCustomer.phone,
          address: this.editableCustomer.address
        };

        const result = await updateCustomer(this.selectedCustomer.customerId, updates);

        // Update notes separately
        const notesValue = this.editableCustomer.notes || "";
        console.log("Sending notes update:", notesValue);
        await updateNotes(this.selectedCustomer.customerId, notesValue);

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

    async updateProfilePicture(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alert("Only image files are allowed.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large. Maximum size is 5MB.");
        return;
      }

      try {
        this.loading = true;

        // Convert to base64
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = async (e) => {
          try {
            // Create a canvas to resize the image
            const img = new Image();
            img.src = e.target.result;

            await new Promise(resolve => {
              img.onload = resolve;
            });

            // Calculate new dimensions (max 500px width/height)
            let width = img.width;
            let height = img.height;
            const maxSize = 500;

            if (width > height && width > maxSize) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            } else if (height > maxSize) {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }

            // Create canvas and resize
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            // Draw resized image to canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Get compressed base64 (0.7 quality JPEG)
            const base64Image = canvas.toDataURL('image/jpeg', 0.7);

            // Upload the image
            const response = await uploadCustomerProfilePicture(
              this.selectedCustomer.customerId,
              base64Image
            );

            if (response.success) {
              // Update local state
              this.editableCustomer.profilePicture = response.profilePictureUrl;

              // Update the customer in the contacts list
              const contactIndex = this.contacts.findIndex(
                c => c.customerId === this.selectedCustomer.customerId
              );

              if (contactIndex !== -1) {
                // Create a new object to ensure reactivity
                this.contacts[contactIndex] = {
                  ...this.contacts[contactIndex],
                  profilePicture: response.profilePictureUrl
                };
              }

              // Refetch the customer to get updated data
              await this.selectCustomer({
                customerId: this.selectedCustomer.customerId
              });

            }
          } catch (error) {
            console.error("Error uploading profile picture:", error);
            alert(`Failed to upload profile picture: ${error.message}`);
          } finally {
            this.loading = false;
          }
        };
      } catch (error) {
        console.error("Error processing image:", error);
        alert(`Error processing image: ${error.message}`);
        this.loading = false;
      }
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

      const normalized = this.selectedCustomer.assignedUsers.map(id =>
        typeof id === "object" && id.S ? id.S : String(id)
      );

      return normalized.includes(String(userId));
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
    uploadImage(event) {
      const file = event.target.files[0];
      console.log("Selected file:", file);

      if (!file) {
        console.error("No file selected");
        return;
      }

      if (!file.type.startsWith('image/')) {
        console.error("Invalid file type:", file.type);
        alert("Only image files are allowed.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        console.error("File too large:", file.size);
        alert("File is too large. Maximum size is 5MB.");
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          console.log("File read successful, result length:", e.target.result.length);
          console.log("Result starts with:", e.target.result.substring(0, 50) + "...");

          // Create a canvas to resize the image
          const img = new Image();
          img.onload = () => {
            console.log("Image loaded, original dimensions:", img.width, "x", img.height);

            // Calculate new dimensions (max 500px width/height)
            let width = img.width;
            let height = img.height;
            const maxSize = 500;

            if (width > height && width > maxSize) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            } else if (height > maxSize) {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }

            console.log("Resized dimensions:", width, "x", height);

            // Create canvas and resize
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            // Draw resized image to canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Get compressed base64 (0.7 quality JPEG)
            const resizedImage = canvas.toDataURL('image/jpeg', 0.7);
            console.log("Resized image length:", resizedImage.length);
            console.log("Resized image starts with:", resizedImage.substring(0, 50) + "...");

            this.newContact.profilePicture = resizedImage;
          };

          img.onerror = (err) => {
            console.error("Error loading image:", err);
            alert("Error processing image. Please try another file.");
          };

          img.src = e.target.result;
        } catch (error) {
          console.error("Error processing image:", error);
          alert(`Error processing image: ${error.message}`);
        }
      };

      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        alert("Error reading file. Please try again.");
      };

      reader.readAsDataURL(file);
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
    this.fetchAllUsers();
    window.addEventListener('resize', this.closeAllSidebars);
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.closeAllSidebars);
    window.removeEventListener('resize', this.handleResize);
  }
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
  position: relative;
}

/* Mobile Navigation */
.mobile-nav {
  display: flex;
  width: 100%;
  height: 50px;
  background-color: #1E1F22;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
  position: relative;
  z-index: 20;
  border-bottom: 1px solid #232428;
}

.mobile-nav-button {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.mobile-title {
  color: white;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60%;
  text-align: center;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #ED4245;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.left-sidebar {
  flex: 1;
  min-width: 210px;
  width: 100%;
  max-width: 300px;
  background-color: #1E1F22;
  padding-right: 16px;
  padding-left: 2px;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #232428;
  overflow-y: auto;
}

/* Sidebar Base (Hidden by Default) */
.left-sidebar.mobile-sidebar,
.right-sidebar.mobile-sidebar {
  position: fixed;
  top: 0;
  height: 100vh;
  width: 80vw;
  z-index: 1000;
  background-color: #1E1F22;
  overflow-y: auto;
  transition: transform 0.3s ease-in-out;
  display: none;
}

/* Show State */
.left-sidebar.mobile-sidebar.show,
.right-sidebar.mobile-sidebar.show {
  display: block;
}

/* Slide In Animations */
.left-sidebar.mobile-sidebar {
  left: 0;
  transform: translateX(-100%);
}

.left-sidebar.mobile-sidebar.show {
  transform: translateX(0);
}

.right-sidebar.mobile-sidebar {
  right: 0;
  left: auto;
  transform: translateX(100%);
}

.right-sidebar.mobile-sidebar.show {
  transform: translateX(0);
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

/* Mobile view - always show delete button */
.mobile-sidebar .delete-btn {
  visibility: visible;
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
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE 10+ */
  padding-bottom: 20px;
}

.tab-content-container::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari */
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

/* Mobile new task layout */
.mobile-new-task {
  flex-direction: column;
}

.mobile-new-task input {
  margin-bottom: 10px;
}

.mobile-new-task .add-button {
  margin-top: 5px;
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
  flex: 1;
  min-width: 210px;
  width: 100%;
  max-width: 300px;
  background-color: #1E1F22;
  padding-top: 16px;
  padding-left: 16px;
  padding-right: 2px;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #232428;
  overflow-y: auto;
}

.right-sidebar h2 {
  font-size: 18px;
  margin-bottom: 16px;
  margin-top: 0px;
}

.right-sidebar .contact {
  position: relative;
}

.right-sidebar .delete-btn {
  visibility: hidden;
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: #FF5555;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  opacity: 0.7;
}

.right-sidebar .contact:hover .delete-btn {
  visibility: visible;
}

.right-sidebar .delete-btn:hover {
  opacity: 1;
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

/* Mobile modal */
.mobile-modal {
  width: 90%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
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
  box-sizing: border-box;
  /* This is the key property */
  padding: 10px 10px;
  /* Top/bottom and left/right padding */
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .form-group {
    margin-bottom: 12px;
  }

  .task {
    flex-wrap: wrap;
  }

  .task .due-date {
    width: 100%;
    margin-left: 28px;
    margin-top: 5px;
  }

  .tab-content {
    padding: 15px;
  }

  .empty-content {
    padding: 20px;
  }

  .empty-content h2 {
    font-size: 20px;
  }
}

.mobile-sidebar-triggers {
  display: flex;
  justify-content: space-between;
  padding: 10px 16px;
  background-color: #2B2D31;
  border-bottom: 1px solid #232428;
  z-index: 15;
}

.trigger-left,
.trigger-right {
  color: #7289DA;
  font-weight: bold;
  cursor: pointer;
  text-decoration: underline;
}

.mobile-sidebar {
  display: none;
}

.mobile-sidebar.show {
  display: block;
  position: fixed;
  top: 0;
  bottom: 0;
  height: 100%;
  background-color: #1E1F22;
  z-index: 1000;
  transition: transform 0.3s ease-in-out;
  overflow-y: auto;
}

.left-sidebar.mobile-sidebar {
  left: 0;
  width: 80vw;
  transform: translateX(-100%);
}

.left-sidebar.mobile-sidebar.show {
  transform: translateX(0);
}

.right-sidebar.mobile-sidebar {
  right: 0;
  width: 80vw;
  transform: translateX(100%);
}

.right-sidebar.mobile-sidebar.show {
  transform: translateX(0);
}

/* Remove padding on mobile */
@media (max-width: 768px) {
  .content-container.mobile-view {
    padding: 0;
  }

  .customer-details-panel.mobile-main {
    padding: 0;
  }

  .tab-content {
    padding: 15px;
    padding-bottom: 50px !important;
  }

  /* Fix sidebars position to account for header */
  .left-sidebar.mobile-sidebar,
  .right-sidebar.mobile-sidebar {
    top: 70px;
    /* Adjust this to match your header height */
    height: calc(100vh - 40px);
    padding-top: 20px;
  }

  /* Ensure sidebar content starts below header */
  .mobile-sidebar-header {
    margin-bottom: 15px;
  }

}

/* Make sure the mobile sidebar triggers are properly styled */
.mobile-sidebar-triggers {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  background-color: #36393F;
  border-bottom: 1px solid #36393F;
}

.trigger-left,
.trigger-right {
  color: #7289DA;
  font-weight: bold;
  cursor: pointer;
}

/* Ensure the overlay covers the entire screen */
.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
}

/* Work Page Styles */
.work-page {
  background-color: #36393F;
}

.work-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.work-page-header h2 {
  margin: 0;
}

.filter-controls {
  display: flex;
  align-items: center;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  user-select: none;
  color: #B9BBBE;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: relative;
  height: 18px;
  width: 18px;
  background-color: #2E3035;
  border-radius: 3px;
  margin-right: 8px;
}

.checkbox-container:hover input~.checkmark {
  background-color: #3E4045;
}

.checkbox-container input:checked~.checkmark {
  background-color: #5865F2;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked~.checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 6px;
  top: 3px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.all-tasks {
  margin-top: 10px;
}

.task.all-task {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  background-color: #2E3035;
  border-radius: 4px;
  margin-bottom: 8px;
}

.task-details {
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-left: 10px;
}

.task-customer {
  font-size: 12px;
  color: #7289DA;
  margin-top: 4px;
}

.view-tasks-btn {
  background-color: #43b581;
}

.view-tasks-btn:hover {
  background-color: #3ca374;
}

@media (max-width: 768px) {
  .work-page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-controls {
    margin-top: 10px;
  }

  .task.all-task {
    flex-wrap: wrap;
  }

  .task.all-task .due-date {
    margin-left: 28px;
    margin-top: 5px;
    width: 100%;
  }
}
</style>