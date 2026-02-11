// conversations.js - Conversation Management
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!window.auth.protectPage()) return;
    
    // Display user name
    const currentUser = window.auth.getCurrentUser();
    document.getElementById('userName').textContent = currentUser.name;
    
    // Setup logout event
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        window.auth.logout();
    });
    
    // Setup search and filter events
    document.getElementById('searchInput').addEventListener('input', debounce(loadConversations, 500));
    document.getElementById('statusFilter').addEventListener('change', loadConversations);
    document.getElementById('severityFilter').addEventListener('change', loadConversations);
    
    // Load conversations
    loadConversations();
});

// Variables for conversation management
let conversations = [];
let currentConversationId = null;

// Function to load conversations
async function loadConversations() {
    try {
        // Show loading indicator
        document.getElementById('conversationsLoading').classList.remove('d-none');
        document.getElementById('conversationsList').innerHTML = '';
        
        // Collect search criteria
        const searchTerm = document.getElementById('searchInput').value;
        const status = document.getElementById('statusFilter').value;
        const severity = document.getElementById('severityFilter').value;
        
        // Simulate fetching data
        await simulateAPICall(1000);
        
        // Generate mock conversations
        conversations = generateMockConversations(12);
        
        // Apply filtering
        let filteredConversations = conversations;
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredConversations = filteredConversations.filter(conv => 
                conv.user1.name.toLowerCase().includes(term) || 
                conv.user2.name.toLowerCase().includes(term)
            );
        }
        
        if (status) {
            filteredConversations = filteredConversations.filter(conv => conv.status === status);
        }
        
        if (severity) {
            filteredConversations = filteredConversations.filter(conv => conv.severity === severity);
        }
        
        // Display conversations
        displayConversationsList(filteredConversations);
        
        // Hide loading indicator
        document.getElementById('conversationsLoading').classList.add('d-none');
        
    } catch (error) {
        console.error('Failed to load conversations:', error);
        window.dashboard.showToast('Error loading conversations', 'danger');
        document.getElementById('conversationsLoading').classList.add('d-none');
    }
}

// Function to display conversations list
function displayConversationsList(conversationsList) {
    const list = document.getElementById('conversationsList');
    list.innerHTML = '';
    
    if (conversationsList.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No conversations</h5>
                <p class="text-muted">No conversations match your search criteria</p>
            </div>
        `;
        return;
    }
    
    conversationsList.forEach(conversation => {
        const item = document.createElement('div');
        item.className = `conversation-item p-3 border-bottom ${conversation.id === currentConversationId ? 'active' : ''}`;
        
        // Determine severity badge
        let severityBadge = '';
        if (conversation.severity === 'high') {
            severityBadge = '<span class="badge bg-danger"><i class="fas fa-exclamation-circle me-1"></i>High</span>';
        } else if (conversation.severity === 'medium') {
            severityBadge = '<span class="badge bg-warning"><i class="fas fa-exclamation-circle me-1"></i>Medium</span>';
        } else {
            severityBadge = '<span class="badge bg-info">Low</span>';
        }
        
        // Determine status badge
        let statusBadge = '';
        if (conversation.status === 'pending') {
            statusBadge = '<span class="badge bg-warning">Pending</span>';
        } else {
            statusBadge = '<span class="badge bg-success">Resolved</span>';
        }
        
        // Count reported messages
        const reportedCount = conversation.messages.filter(m => m.reported).length;
        
        // Get last message text
        const lastMessage = conversation.messages[conversation.messages.length - 1];
        const lastMessageText = lastMessage ? lastMessage.text.substring(0, 50) + '...' : 'No messages';
        
        item.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div class="me-3 flex-grow-1">
                    <div class="d-flex align-items-center mb-1">
                        <div class="user-avatar me-2">
                            <i class="fas fa-user"></i>
                        </div>
                        <div>
                            <h6 class="mb-0">${conversation.user1.name} & ${conversation.user2.name}</h6>
                            <small class="text-muted">${formatTimeAgo(conversation.lastMessage)}</small>
                        </div>
                    </div>
                    <p class="mb-1 text-muted small">
                        ${lastMessageText}
                    </p>
                </div>
                <div class="text-end">
                    ${severityBadge}
                    ${statusBadge}
                    ${reportedCount > 0 ? `
                        <div class="mt-1">
                            <small class="text-danger">
                                <i class="fas fa-flag me-1"></i>${reportedCount}
                            </small>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        item.addEventListener('click', function() {
            // Remove active from all items
            document.querySelectorAll('.conversation-item').forEach(el => {
                el.classList.remove('active');
            });
            
            // Add active to current item
            this.classList.add('active');
            
            // Show conversation details
            showConversationDetails(conversation.id);
        });
        
        list.appendChild(item);
    });
}

// Function to show conversation details
function showConversationDetails(conversationId) {
    currentConversationId = conversationId;
    const conversation = conversations.find(c => c.id === conversationId);
    
    if (!conversation) return;
    
    // Update title and actions
    document.getElementById('conversationTitle').textContent = 
        `Conversation between ${conversation.user1.name} and ${conversation.user2.name}`;
    document.getElementById('conversationActions').classList.remove('d-none');
    
    // Update user info
    document.getElementById('user1Name').textContent = conversation.user1.name;
    document.getElementById('user1Age').textContent = `${conversation.user1.age} years`;
    document.getElementById('user2Name').textContent = conversation.user2.name;
    document.getElementById('user2Age').textContent = `${conversation.user2.age} years`;
    
    // Display conversation
    displayConversation(conversation.messages);
    
    // Update statistics
    updateConversationStats(conversation);
    
    // Show conversation statistics and info
    document.getElementById('conversationStats').classList.remove('d-none');
    document.getElementById('conversationInfo').classList.remove('d-none');
}

// Function to display conversation messages
function displayConversation(messages) {
    const container = document.getElementById('conversationContent');
    container.innerHTML = '';
    
    if (messages.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comment-slash fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No messages</h5>
                <p class="text-muted">This conversation has no messages</p>
            </div>
        `;
        return;
    }
    
    // Create message container
    const messageContainer = document.createElement('div');
    messageContainer.className = 'message-container';
    
    messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.sender === 'user1' ? 'message-sent' : 'message-received'} ${message.reported ? 'message-reported' : ''}`;
        
        if (message.reported) {
            messageDiv.title = 'This message was reported';
        }
        
        messageDiv.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <strong>${message.sender === 'user1' ? 'User 1' : 'User 2'}</strong>
                    ${message.reported ? '<i class="fas fa-flag text-danger ms-2"></i>' : ''}
                </div>
                <small class="message-time">${formatTime(message.timestamp)}</small>
            </div>
            <p class="mb-0 mt-1">${message.text}</p>
            ${message.reported && message.reportReason ? 
                `<small class="text-danger d-block mt-1">
                    <i class="fas fa-info-circle me-1"></i>Report reason: ${message.reportReason}
                </small>` : ''}
        `;
        
        messageContainer.appendChild(messageDiv);
    });
    
    container.appendChild(messageContainer);
}

// Function to update conversation statistics
function updateConversationStats(conversation) {
    const reportedCount = conversation.messages.filter(m => m.reported).length;
    
    document.getElementById('messagesCount').textContent = conversation.messages.length;
    document.getElementById('reportedMessages').textContent = reportedCount;
    document.getElementById('conversationStart').textContent = formatDate(conversation.createdAt);
    document.getElementById('lastMessage').textContent = formatTimeAgo(conversation.lastMessage);
}

// Function to resolve conversation
async function resolveConversation() {
    if (!currentConversationId) return;
    
    if (!confirm('Are you sure you want to resolve this conversation?')) return;
    
    try {
        // Simulate resolving conversation
        await simulateAPICall(800);
        
        window.dashboard.showToast('Conversation resolved successfully', 'success');
        
        // Refresh conversations
        loadConversations();
        
        // Reset conversation view
        resetConversationView();
        
    } catch (error) {
        console.error('Failed to resolve conversation:', error);
        window.dashboard.showToast('Error resolving conversation', 'danger');
    }
}

// Function to delete conversation
async function deleteConversation() {
    if (!currentConversationId) return;
    
    if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) return;
    
    try {
        // Simulate deleting conversation
        await simulateAPICall(800);
        
        window.dashboard.showToast('Conversation deleted successfully', 'success');
        
        // Refresh conversations
        loadConversations();
        
        // Reset view
        resetConversationView();
        
    } catch (error) {
        console.error('Failed to delete conversation:', error);
        window.dashboard.showToast('Error deleting conversation', 'danger');
    }
}

// Function to refresh conversations
function refreshConversations() {
    loadConversations();
    resetConversationView();
}

// Function to reset filters
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('severityFilter').value = '';
    loadConversations();
    resetConversationView();
}

// Function to reset conversation view
function resetConversationView() {
    currentConversationId = null;
    
    document.getElementById('conversationTitle').textContent = 'Select a Conversation';
    document.getElementById('conversationActions').classList.add('d-none');
    document.getElementById('conversationStats').classList.add('d-none');
    document.getElementById('conversationInfo').classList.add('d-none');
    
    document.getElementById('conversationContent').innerHTML = `
        <div class="empty-state">
            <i class="fas fa-comments fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">Select a Conversation</h5>
            <p class="text-muted">Click on a conversation from the list to view details</p>
        </div>
    `;
    
    // Remove active class from all conversation items
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.remove('active');
    });
}

// Helper functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) {
        return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hours ago`;
    } else if (diffDays < 30) {
        return `${diffDays} days ago`;
    } else {
        return formatDate(dateString);
    }
}

function simulateAPICall(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
}

function generateMockConversations(count) {
    const conversations = [];
    const users = [
        { id: 1, name: 'Ahmed Mohamed', age: 28 },
        { id: 2, name: 'Sara Khalid', age: 25 },
        { id: 3, name: 'Mohammed Ali', age: 32 },
        { id: 4, name: 'Fatima Said', age: 23 },
        { id: 5, name: 'Khalid Abdullah', age: 30 },
        { id: 6, name: 'Nora Hassan', age: 27 }
    ];
    
    const reasons = [
        'Inappropriate content',
        'Harassment',
        'Spam messages',
        'Scam/Fraud',
        'Offensive content',
        'Inappropriate behavior'
    ];
    
    for (let i = 1; i <= count; i++) {
        const user1 = users[Math.floor(Math.random() * users.length)];
        let user2;
        do {
            user2 = users[Math.floor(Math.random() * users.length)];
        } while (user2.id === user1.id);
        
        const severity = ['high', 'medium', 'low'][Math.floor(Math.random() * 3)];
        const status = Math.random() > 0.3 ? 'pending' : 'resolved';
        
        // Create mock messages
        const messages = [];
        const messageCount = Math.floor(Math.random() * 15) + 5;
        const createdAt = new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000);
        
        for (let j = 0; j < messageCount; j++) {
            const sender = Math.random() > 0.5 ? 'user1' : 'user2';
            const reported = Math.random() > 0.7;
            const timestamp = new Date(createdAt.getTime() + j * 60000);
            
            messages.push({
                id: j + 1,
                sender: sender,
                text: `This is message ${j + 1} from ${sender === 'user1' ? user1.name : user2.name}.`,
                timestamp: timestamp.toISOString(),
                reported: reported,
                reportReason: reported ? reasons[Math.floor(Math.random() * reasons.length)] : null
            });
        }
        
        conversations.push({
            id: i,
            user1: user1,
            user2: user2,
            severity: severity,
            status: status,
            messages: messages,
            createdAt: createdAt.toISOString(),
            lastMessage: messages[messages.length - 1].timestamp
        });
    }
    
    return conversations;
}