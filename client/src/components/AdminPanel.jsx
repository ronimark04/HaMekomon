import React, { useState, useEffect } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Input,
    Checkbox,
    RadioGroup,
    Radio,
    Pagination,
    Chip,
    useDisclosure,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Textarea,
    Select,
    SelectItem,
    Divider,
    Link,
    Spinner
} from "@heroui/react";
import { useAuth } from '../context/authContext';
import { useLanguage } from '../context/languageContext';
import { useNavigate } from 'react-router-dom';
import AddArtistModal from './AddArtistModal';
import UpdateArtistModal from './UpdateArtistModal';
import DeleteUserModal from './DeleteUserModal';
import DeleteArtistModal from './DeleteArtistModal';

const AdminPanel = () => {
    const { user } = useAuth();
    const { language } = useLanguage();
    const navigate = useNavigate();

    // Redirect if not admin
    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate('/');
        }
    }, [user, navigate]);

    // View state 'users' or 'artists'
    const [currentView, setCurrentView] = useState('users');

    // Users state
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [userFilter, setUserFilter] = useState('all'); // 'all', 'admins', 'non-admins'
    const [userSortBy, setUserSortBy] = useState('name'); // 'name', 'dateJoined'
    const [userSearch, setUserSearch] = useState('');
    const [currentUserPage, setCurrentUserPage] = useState(1);
    const [usersPerPage] = useState(20);

    // Artists state
    const [artists, setArtists] = useState([]);
    const [filteredArtists, setFilteredArtists] = useState([]);
    const [areas, setAreas] = useState([]);
    const [areaFilter, setAreaFilter] = useState('all'); // 'all' or specific area
    const [selectedAreas, setSelectedAreas] = useState([]);
    const [currentArtistPage, setCurrentArtistPage] = useState(1);
    const [artistsPerPage] = useState(25);

    // Loading states
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingArtists, setLoadingArtists] = useState(false);
    const [loadingAreas, setLoadingAreas] = useState(false);

    // Modal states
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [editingArtist, setEditingArtist] = useState(null);

    // Fetch users
    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const response = await fetch('/users', {
                headers: {
                    'x-auth-token': localStorage.getItem('token')
                }
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
                setFilteredUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    // Fetch artists
    const fetchArtists = async () => {
        setLoadingArtists(true);
        try {
            const response = await fetch('/artists');
            if (response.ok) {
                const data = await response.json();
                setArtists(data);
                setFilteredArtists(data);
            }
        } catch (error) {
            console.error('Error fetching artists:', error);
        } finally {
            setLoadingArtists(false);
        }
    };

    // Fetch areas
    const fetchAreas = async () => {
        setLoadingAreas(true);
        try {
            console.log('Fetching areas...'); // Debug log
            const response = await fetch('/areas');
            console.log('Areas response status:', response.status); // Debug log
            if (response.ok) {
                const data = await response.json();
                console.log('Areas data received:', data); // Debug log
                setAreas(data);
            } else {
                console.error('Areas response not ok:', response.status, response.statusText); // Debug log
            }
        } catch (error) {
            console.error('Error fetching areas:', error);
        } finally {
            setLoadingAreas(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        if (user && user.isAdmin) {
            fetchUsers();
            fetchArtists();
            fetchAreas();
        }
    }, [user]);

    // Filter and sort users
    useEffect(() => {
        let filtered = [...users];

        // Apply search filter
        if (userSearch) {
            filtered = filtered.filter(user =>
                user.username.toLowerCase().includes(userSearch.toLowerCase())
            );
        }

        // Apply admin filter
        if (userFilter === 'admins') {
            filtered = filtered.filter(user => user.isAdmin);
        } else if (userFilter === 'non-admins') {
            filtered = filtered.filter(user => !user.isAdmin);
        }

        // Apply sorting
        if (userSortBy === 'name') {
            filtered.sort((a, b) => a.username.localeCompare(b.username));
        } else if (userSortBy === 'dateJoined') {
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        setFilteredUsers(filtered);
        setCurrentUserPage(1); // Reset to first page when filtering
    }, [users, userFilter, userSortBy, userSearch]);

    // Filter artists by area
    useEffect(() => {
        let filtered = [...artists];

        if (areaFilter !== 'all' && selectedAreas.length > 0) {
            filtered = filtered.filter(artist =>
                selectedAreas.includes(artist.area?._id)
            );
        }

        setFilteredArtists(filtered);
        setCurrentArtistPage(1); // Reset to first page when filtering
    }, [artists, areaFilter, selectedAreas]);

    // Pagination for users
    const paginatedUsers = filteredUsers.slice(
        (currentUserPage - 1) * usersPerPage,
        currentUserPage * usersPerPage
    );

    // Pagination for artists
    const paginatedArtists = filteredArtists.slice(
        (currentArtistPage - 1) * artistsPerPage,
        currentArtistPage * artistsPerPage
    );

    // Handle user deletion
    const handleDeleteUser = (user) => {
        setSelectedUser(user);
    };

    // Handle artist deletion
    const handleDeleteArtist = (artist) => {
        setSelectedArtist(artist);
    };

    // Handle artist editing
    const handleEditArtist = (artist) => {
        setEditingArtist(artist);
    };

    // Handle user admin status toggle
    const handleToggleAdmin = async (userId, newAdminStatus) => {
        try {
            const response = await fetch(`/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify({ isAdmin: newAdminStatus })
            });

            if (response.ok) {
                // Refresh users list
                fetchUsers();
            }
        } catch (error) {
            console.error('Error updating user admin status:', error);
        }
    };

    // Translations
    const translations = {
        adminPanel: { heb: 'פאנל מנהל', eng: 'Admin Panel' },
        users: { heb: 'משתמשים', eng: 'Users' },
        artists: { heb: 'אמנים', eng: 'Artists' },
        viewAll: { heb: 'הצג הכל', eng: 'View All' },
        admins: { heb: 'מנהלים', eng: 'Admins' },
        nonAdmins: { heb: 'לא מנהלים', eng: 'Non-Admins' },
        sortByName: { heb: 'מיין לפי שם', eng: 'Sort by Name' },
        sortByDate: { heb: 'מיין לפי תאריך הצטרפות', eng: 'Sort by Date Joined' },
        searchUsers: { heb: 'חפש משתמשים...', eng: 'Search users...' },
        username: { heb: 'שם משתמש', eng: 'Username' },
        dateJoined: { heb: 'תאריך הצטרפות', eng: 'Date Joined' },
        isAdmin: { heb: 'מנהל', eng: 'Admin' },
        actions: { heb: 'פעולות', eng: 'Actions' },
        delete: { heb: 'מחק', eng: 'Delete' },
        edit: { heb: 'ערוך', eng: 'Edit' },
        allAreas: { heb: 'כל האזורים', eng: 'All Areas' },
        area: { heb: 'אזור:', eng: 'Area:' },
        areaTable: { heb: 'אזור', eng: 'Area' },
        addNewArtist: { heb: 'הוסף אמן חדש', eng: 'Add New Artist' },
        name: { heb: 'שם', eng: 'Name' },
        of: { heb: 'מתוך', eng: 'of' },
        loading: { heb: 'טוען...', eng: 'Loading...' },
        noUsers: { heb: 'לא נמצאו משתמשים', eng: 'No users found' },
        noArtists: { heb: 'לא נמצאו אמנים', eng: 'No artists found' }
    };

    if (!user || !user.isAdmin) {
        return null;
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl min-h-screen">
            <Card className="w-full">
                <CardHeader className={`flex gap-3 ${language === 'heb' ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex flex-col">
                        <p className="text-md">
                            {translations.adminPanel[language]}
                        </p>
                    </div>
                </CardHeader>
                <CardBody>
                    {/* View Toggle */}
                    <div className={`flex gap-4 mb-6 ${language === 'heb' ? 'justify-end' : 'justify-start'}`}>
                        <Button
                            color={currentView === 'users' ? 'primary' : 'default'}
                            variant={currentView === 'users' ? 'solid' : 'bordered'}
                            onPress={() => setCurrentView('users')}
                        >
                            {translations.users[language]}
                        </Button>
                        <Button
                            color={currentView === 'artists' ? 'primary' : 'default'}
                            variant={currentView === 'artists' ? 'solid' : 'bordered'}
                            onPress={() => setCurrentView('artists')}
                        >
                            {translations.artists[language]}
                        </Button>
                    </div>

                    {/* Users View */}
                    {currentView === 'users' && (
                        <div>
                            {/* Filters and Search */}
                            <div className={`flex flex-wrap gap-4 mb-6 ${language === 'heb' ? 'justify-end' : 'justify-start'}`}>
                                <Dropdown>
                                    <DropdownTrigger>
                                        <Button variant="bordered">
                                            {userFilter === 'all' ? translations.viewAll[language] :
                                                userFilter === 'admins' ? translations.admins[language] :
                                                    translations.nonAdmins[language]}
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        onAction={(key) => setUserFilter(key)}
                                        dir={language === 'heb' ? 'rtl' : 'ltr'}
                                    >
                                        <DropdownItem key="all">{translations.viewAll[language]}</DropdownItem>
                                        <DropdownItem key="admins">{translations.admins[language]}</DropdownItem>
                                        <DropdownItem key="non-admins">{translations.nonAdmins[language]}</DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>

                                <Dropdown>
                                    <DropdownTrigger>
                                        <Button variant="bordered">
                                            {userSortBy === 'name' ? translations.sortByName[language] : translations.sortByDate[language]}
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        onAction={(key) => setUserSortBy(key)}
                                        dir={language === 'heb' ? 'rtl' : 'ltr'}
                                    >
                                        <DropdownItem key="name">{translations.sortByName[language]}</DropdownItem>
                                        <DropdownItem key="dateJoined">{translations.sortByDate[language]}</DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>

                                <Input
                                    placeholder={translations.searchUsers[language]}
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    className="max-w-xs"
                                    dir={language === 'heb' ? 'rtl' : 'ltr'}
                                />
                            </div>

                            {/* Users Table */}
                            {loadingUsers ? (
                                <div className="text-center py-8">
                                    <Spinner color="danger" size="lg" />
                                </div>
                            ) : (
                                <>
                                    <Table aria-label="Users table" dir={language === 'heb' ? 'rtl' : 'ltr'}>
                                        <TableHeader>
                                            <TableColumn>{translations.username[language]}</TableColumn>
                                            <TableColumn>{translations.dateJoined[language]}</TableColumn>
                                            <TableColumn>{translations.isAdmin[language]}</TableColumn>
                                            <TableColumn>{translations.actions[language]}</TableColumn>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedUsers.map((user) => (
                                                <TableRow key={user._id}>
                                                    <TableCell>{user.username}</TableCell>
                                                    <TableCell>
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Checkbox
                                                            isSelected={user.isAdmin}
                                                            onValueChange={(checked) => handleToggleAdmin(user._id, checked)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="light"
                                                            color="danger"
                                                            onPress={() => handleDeleteUser(user)}
                                                        >
                                                            🗑️
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {paginatedUsers.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            {translations.noUsers[language]}
                                        </div>
                                    )}

                                    {/* Pagination */}
                                    <div className="flex justify-between items-center mt-4">
                                        <span style={{ direction: language === 'heb' ? 'rtl' : 'ltr' }}>
                                            {paginatedUsers.length} {translations.of[language]} {filteredUsers.length}
                                        </span>
                                        <Pagination
                                            total={Math.ceil(filteredUsers.length / usersPerPage)}
                                            page={currentUserPage}
                                            onChange={setCurrentUserPage}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Artists View */}
                    {currentView === 'artists' && (
                        <div>
                            {/* Add New Artist Button */}
                            <div className="flex justify-center mb-6">
                                <Button
                                    color="primary"
                                    onPress={() => setEditingArtist({})}
                                >
                                    {translations.addNewArtist[language]}
                                </Button>
                            </div>

                            {/* Filters */}
                            <div className={`flex flex-wrap gap-4 mb-6 ${language === 'heb' ? 'justify-end' : 'justify-start'}`}>
                                <RadioGroup
                                    value={areaFilter}
                                    onValueChange={setAreaFilter}
                                    orientation="horizontal"
                                    dir={language === 'heb' ? 'rtl' : 'ltr'}
                                >
                                    <Radio value="all">{translations.allAreas[language]}</Radio>
                                    <Radio value="specific">{translations.area[language]}</Radio>
                                </RadioGroup>

                                {areaFilter === 'specific' && (
                                    <div className="flex flex-wrap gap-2">
                                        {areas.map((area) => (
                                            <Checkbox
                                                key={area._id}
                                                isSelected={selectedAreas.includes(area._id)}
                                                onValueChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedAreas([...selectedAreas, area._id]);
                                                    } else {
                                                        setSelectedAreas(selectedAreas.filter(id => id !== area._id));
                                                    }
                                                }}
                                            >
                                                {area.name}
                                            </Checkbox>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Artists Table */}
                            {loadingArtists ? (
                                <div className="text-center py-8">
                                    <Spinner color="danger" size="lg" />
                                </div>
                            ) : (
                                <div className="flex justify-center">
                                    <div className="w-1/2">
                                        <Table
                                            aria-label="Artists table"
                                            dir={language === 'heb' ? 'rtl' : 'ltr'}
                                        >
                                            <TableHeader>
                                                <TableColumn>{translations.name[language]}</TableColumn>
                                                <TableColumn>{translations.areaTable[language]}</TableColumn>
                                                <TableColumn>{translations.actions[language]}</TableColumn>
                                            </TableHeader>
                                            <TableBody>
                                                {paginatedArtists.map((artist) => (
                                                    <TableRow key={artist._id}>
                                                        <TableCell>
                                                            <Link
                                                                href={`/artist/${artist._id}`}
                                                                target="_blank"
                                                                className="text-foreground hover:text-primary transition-colors"
                                                            >
                                                                {language === 'heb' ? artist.name.heb : artist.name.eng}
                                                            </Link>
                                                        </TableCell>
                                                        <TableCell>
                                                            {artist.area ? artist.area.name : '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    isIconOnly
                                                                    size="sm"
                                                                    variant="light"
                                                                    color="primary"
                                                                    onPress={() => handleEditArtist(artist)}
                                                                >
                                                                    ✏️
                                                                </Button>
                                                                <Button
                                                                    isIconOnly
                                                                    size="sm"
                                                                    variant="light"
                                                                    color="danger"
                                                                    onPress={() => handleDeleteArtist(artist)}
                                                                >
                                                                    🗑️
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}

                            {filteredArtists.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    {translations.noArtists[language]}
                                </div>
                            )}

                            {/* Pagination */}
                            <div className="flex justify-between items-center mt-4">
                                <span style={{ direction: language === 'heb' ? 'rtl' : 'ltr' }}>
                                    {paginatedArtists.length} {translations.of[language]} {filteredArtists.length}
                                </span>
                                <Pagination
                                    total={Math.ceil(filteredArtists.length / artistsPerPage)}
                                    page={currentArtistPage}
                                    onChange={setCurrentArtistPage}
                                />
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Modals */}
            {selectedUser && (
                <DeleteUserModal
                    user={selectedUser}
                    isOpen={!!selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onSuccess={() => {
                        setSelectedUser(null);
                        fetchUsers();
                    }}
                />
            )}

            {selectedArtist && (
                <DeleteArtistModal
                    artist={selectedArtist}
                    isOpen={!!selectedArtist}
                    onClose={() => setSelectedArtist(null)}
                    onSuccess={() => {
                        setSelectedArtist(null);
                        fetchArtists();
                    }}
                />
            )}

            {editingArtist && Object.keys(editingArtist).length === 0 && (
                <AddArtistModal
                    isOpen={!!editingArtist}
                    onClose={() => setEditingArtist(null)}
                    onSuccess={() => {
                        setEditingArtist(null);
                        fetchArtists();
                    }}
                    areas={areas}
                />
            )}

            {editingArtist && editingArtist._id && (
                <UpdateArtistModal
                    artist={editingArtist}
                    isOpen={!!editingArtist}
                    onClose={() => setEditingArtist(null)}
                    onSuccess={() => {
                        setEditingArtist(null);
                        fetchArtists();
                    }}
                    areas={areas}
                />
            )}
        </div>
    );
};

export default AdminPanel; 