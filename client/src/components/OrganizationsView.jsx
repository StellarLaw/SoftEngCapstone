import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tabs,
  Tab,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Mail as InviteIcon,
  Check as AcceptIcon,
  Close as RejectIcon
} from '@mui/icons-material';
import axios from 'axios';

const OrganizationsView = () => {
  const [tabValue, setTabValue] = useState(0);
  const [organizations, setOrganizations] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchOrganizations();
    fetchInvitations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/organizations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrganizations(response.data);
    } catch (error) {
      showAlert('Failed to fetch organizations', 'error');
    }
  };

  const fetchInvitations = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/invitations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvitations(response.data);
    } catch (error) {
      showAlert('Failed to fetch invitations', 'error');
    }
  };

  const handleCreateOrg = async () => {
    try {
      await axios.post('http://localhost:5001/api/organizations', 
        { name: newOrgName },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setCreateDialogOpen(false);
      setNewOrgName('');
      fetchOrganizations();
      showAlert('Organization created successfully', 'success');
    } catch (error) {
      showAlert('Failed to create organization', 'error');
    }
  };

  const handleInviteUser = async () => {
    try {
      await axios.post('http://localhost:5001/api/invitations',
        {
          organizationId: selectedOrg._id,
          invitedEmail: inviteEmail
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setInviteDialogOpen(false);
      setInviteEmail('');
      showAlert('Invitation sent successfully', 'success');
    } catch (error) {
      showAlert('Failed to send invitation', 'error');
    }
  };

  const handleInvitationResponse = async (invitationId, status) => {
    try {
      await axios.put(`http://localhost:5001/api/invitations/${invitationId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchInvitations();
      fetchOrganizations();
      showAlert(`Invitation ${status}`, 'success');
    } catch (error) {
      showAlert(`Failed to ${status} invitation`, 'error');
    }
  };

  const showAlert = (message, severity) => {
    setAlert({
      open: true,
      message,
      severity
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="My Organizations" />
          <Tab label="Invitations" />
        </Tabs>

        {/* Organizations Tab */}
        {tabValue === 0 && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">My Organizations</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
              >
                Create Organization
              </Button>
            </Box>
            
            <List>
              {organizations.map((org) => (
                <Card key={org._id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">{org.name}</Typography>
                      {org.owner === user.id && (
                        <Button
                          variant="outlined"
                          startIcon={<InviteIcon />}
                          onClick={() => {
                            setSelectedOrg(org);
                            setInviteDialogOpen(true);
                          }}
                        >
                          Invite User
                        </Button>
                      )}
                    </Box>
                    <Typography color="textSecondary">
                      {org.owner === user.id ? 'Admin' : 'Member'}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </List>
          </Box>
        )}

        {/* Invitations Tab */}
        {tabValue === 1 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Pending Invitations</Typography>
            <List>
              {invitations.map((invitation) => (
                <Card key={invitation._id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1">
                      {invitation.organizationId.name}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      Invited by: {invitation.invitedBy.email}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AcceptIcon />}
                        onClick={() => handleInvitationResponse(invitation._id, 'accepted')}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<RejectIcon />}
                        onClick={() => handleInvitationResponse(invitation._id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
              {invitations.length === 0 && (
                <Typography color="textSecondary">No pending invitations</Typography>
              )}
            </List>
          </Box>
        )}
      </Box>

      {/* Create Organization Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New Organization</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Organization Name"
            fullWidth
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateOrg} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Invite User Dialog */}
      <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)}>
        <DialogTitle>Invite User to {selectedOrg?.name}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="User Email"
            type="email"
            fullWidth
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleInviteUser} variant="contained">Send Invitation</Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert severity={alert.severity} onClose={() => setAlert({ ...alert, open: false })}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OrganizationsView;