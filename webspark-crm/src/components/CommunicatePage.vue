<template>
  <div class="communicate-page">
    <HeaderComponent />

    <div class="content-container">
      <!-- Left Sidebar: Search & Contacts -->
      <div class="left-sidebar">
        <input type="text" placeholder="Search" class="search-bar" />
        <button class="add-new" @click="openModal">+ Add New</button>

        <div class="contacts">
          <div class="contact" v-for="contact in contacts" :key="contact.customerId">
            <img :src="contact.avatar || defaultAvatar" alt="Avatar" class="contact-avatar" />
            <span class="contact-name">{{ contact.name }}</span>
          </div>
        </div>
      </div>

      <!-- Middle-Left Panel: Client Communication & Notes -->
      <div class="middle-left-panel">
        <h2>Client Communication</h2>
        <ul>
          <li @click="selectChannel('text')">Text</li>
          <li @click="selectChannel('email')">Email</li>
          <li @click="selectChannel('call')">Call</li>
        </ul>
        <h2>Notes</h2>
        <ul>
          <li @click="selectChannel('tasks')">Tasks</li>
          <li @click="selectChannel('website')">Website Preferences</li>
          <li @click="selectChannel('social')">Social Media Creatives</li>
        </ul>
      </div>

      <!-- Middle Panel: Chat Window & Message Input -->
      <div class="chat-container">
        <div class="chat-panel">
          <div class="chat-messages">
            <p v-for="(msg, index) in filteredMessages" :key="index" class="chat-message">
              <strong>{{ msg.sender }}:</strong> {{ msg.text }}
            </p>
          </div>

          <!-- Message Input Fixed at Bottom of Chat Panel -->
          <div class="message-input">
            <input type="text" v-model="message" placeholder="Type your message..." />
            <button @click="sendMessage">Send</button>
          </div>
        </div>
      </div>

      <!-- Right Sidebar: Team Members -->
      <div class="right-sidebar">
        <h2>Team Members</h2>
        <div class="team-members">
          <div class="team-member" v-for="member in team" :key="member.id">
            <img :src="member.avatar" alt="Avatar" class="team-avatar" />
            <span class="team-name">{{ member.name }}</span>
          </div>
          <button class="add-new">+ Add New</button>
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
          <button type="submit">Create</button>
          <button type="button" @click="closeModal">Cancel</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import HeaderComponent from "@/components/HeaderComponent.vue";

export default {
  name: "CommunicatePage",
  components: {
    HeaderComponent,
  },
  data() {
    return {
      showModal: false,
      contacts: [],
      team: [
        { id: 1, name: "Sean Foster", avatar: require('@/assets/user.png') },
        { id: 2, name: "Jane Doe", avatar: require('@/assets/user.png') },
      ],
      newContact: {
        name: "",
        address: "",
        companyName: "",
        phone: "",
        email: "",
        profilePicture: null,
      },
      message: "",
      selectedChannel: "text",
      messages: {
        text: [],
        email: [{ sender: "System", text: "No new emails yet." }],
        call: [{ sender: "System", text: "Call history is empty." }],
        tasks: [{ sender: "Project Manager", text: "Remember to finalize the design!" }],
        website: [{ sender: "Client", text: "Can we adjust the navbar styling?" }],
        social: [{ sender: "Marketing", text: "New campaign goes live tomorrow." }],
      },
      defaultAvatar: require('@/assets/logo.png'), // Default avatar if no image is available
    };
  },
  computed: {
    filteredMessages() {
      return this.messages[this.selectedChannel] || [];
    },
  },
  methods: {
    async fetchContacts() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("https://vksxvoy6dk.execute-api.us-west-2.amazonaws.com/dev/customers", {
          headers: { Authorization: `Bearer ${token}` },
        });

        this.contacts = response.data.customers || [];
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    },
    openModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.resetContactForm();
    },
    async saveContact() {
      try {
        console.log("Saving contact:", this.newContact);

        if (!this.newContact.name || !this.newContact.phone || !this.newContact.email) {
          alert("Please fill in all required fields.");
          return;
        }

        const token = localStorage.getItem("token");
        const response = await axios.post("https://vksxvoy6dk.execute-api.us-west-2.amazonaws.com/dev/customers", this.newContact, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          this.contacts.push(response.data.customer);
          this.showModal = false;
          this.resetContactForm();
        } else {
          console.error("Failed to add customer:", response.data.message);
        }
      } catch (error) {
        console.error("Error saving customer:", error);
      }
    },
    uploadImage(event) {
      const file = event.target.files[0];
      this.newContact.profilePicture = file;
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
    sendMessage() {
      if (this.message.trim()) {
        this.messages[this.selectedChannel].push({ sender: "You", text: this.message });
        this.message = "";
      }
    },
    selectChannel(channel) {
      this.selectedChannel = channel;
    },
  },
  mounted() {
    this.fetchContacts();
  },
};
</script>


<style scoped>
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
}

.contact {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px;
}

.contact-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

/* Middle-Left Panel: Communication & Notes */
.middle-left-panel {
  flex: 1.5;
  background-color: #2E3035;
  padding: 16px;
  color: white;
  border-right: 1px solid #3C3F44;
}

.middle-left-panel ul {
  list-style: none;
  padding: 0;
}

.middle-left-panel li {
  cursor: pointer;
  padding: 6px;
}

.middle-left-panel li:hover {
  background-color: #40444B;
  border-radius: 4px;
}

/* Middle Panel: Chat Window & Message Input */
.chat-container {
  flex: 5;
  background-color: #36393F;
  display: flex;
  flex-direction: column;
  padding: 16px;
  position: relative;
}

.chat-messages {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.chat-message {
  color: white;
  padding: 6px 0;
}

/* Message Input Always at Bottom of Chat Column */
.message-input {
  display: flex;
  background-color: #2E3035;
  padding: 10px;
  border-top: 1px solid #3C3F44;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 98%;
}

.message-input input {
  flex-grow: 1;
  padding: 10px;
  border-radius: 4px;
  border: none;
  background-color: #222;
  color: white;
}

.message-input button {
  background-color: #5865F2;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 8px;
}

/* Right Sidebar: Team Members */
.right-sidebar {
  flex: 1.5;
  background-color: #1E1F22;
  padding: 16px;
  color: white;
  border-left: 1px solid #232428;
}

.team-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

/* Modal Overlay - Ensures it's centered and darkens the background */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7); /* Dark overlay for better focus */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999; /* Ensure it appears above all other elements */
}

/* Modal Box */
.modal {
  background: #1E1F22; /* Matches left sidebar */
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  color: white;
}

/* Modal Heading */
.modal h2 {
  margin-bottom: 15px;
  font-size: 18px;
  text-align: center;
  color: #F2F3F5;
}

/* Form Groups */
.form-group {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
}

/* Input Fields */
.modal input {
  padding: 0px;
  padding-top: 10px;
  padding-bottom: 10px;
  border-radius: 4px;
  border: none;
  background-color: #2B2D31;
  color: white;
  outline: none;
  width: 100%;
}

/* File Input */
.modal input[type="file"] {
  background-color: transparent;
}

/* Buttons */
.modal button {
  margin-top: 10px;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: 0.2s ease-in-out;
}

/* Create Button */
.modal button[type="submit"] {
  background-color: #5865F2;
  color: white;
}

.modal button[type="submit"]:hover {
  background-color: #4752C4;
}

/* Cancel Button */
.modal button[type="button"] {
  background-color: #3C3F44;
  color: #F2F3F5;
}

.modal button[type="button"]:hover {
  background-color: #4A4D54;
}

/* Ensure Buttons Are Full Width */
.modal button {
  width: 100%;
}
</style>
