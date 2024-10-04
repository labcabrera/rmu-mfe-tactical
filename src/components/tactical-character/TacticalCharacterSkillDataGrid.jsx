import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { DataGrid, GridActionsCellItem, GridRowEditStopReasons, GridRowModes, GridToolbarContainer } from '@mui/x-data-grid';

import { API_CORE_URL, API_TACTICAL_URL } from "../../constants/environment";

const roles = ['Market', 'Finance', 'Development'];

function EditToolbar(props) {

    const { t } = useTranslation();
    const { setRows, setRowModesModel } = props;

    const handleClick = () => {
        console.log(`EditToolbar.handleClick`);
        const randId = 'pending-select-' + Math.floor(Math.random() * 100000);
        setRows((oldRows) => [
            ...oldRows,
            {
                skillId: randId,
                specialization: null,
                statistics: [],
                ranks: 0,
                statBonus: '',
                racialBonus: '',
                developmentBonus: '',
                customBonus: 0,
                totalBonus: '',
                newId: randId
            },
        ]);
        console.log(`EditToolbar.handleClick 2`);
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [randId]: { mode: GridRowModes.Edit },
        }));
    };

    return (
        <GridToolbarContainer>
            <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>{t('add-skill')}</Button>
        </GridToolbarContainer>
    );
}

const TacticalCharacterSkillDataGrid = ({ tacticalCharacter, setTacticalCharacter }) => {

    const { t, i18n } = useTranslation();

    const [rows, setRows] = useState(tacticalCharacter.skills);
    const [rowModesModel, setRowModesModel] = useState({});

    const [skillCategories, setSkillCategories] = useState([]);
    const [skills, setSkills] = useState([]);

    const handleRowEditStop = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleEditClick = (id) => () => {
        console.log(`handleEditClick ${JSON.stringify(id, null, 2)}`);
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    };

    const handleSaveClick = (skillId) => async () => {
        console.log(`handleSaveClick ${JSON.stringify(skillId, null, 2)}`);
        const row = rows.find(e => e.skillId === skillId);
        if (row.newId) {
            console.log(`TacticalCharacterSkillDataGrid.handleSaveClick process new`);
            const request = {
                skillId: skillId,
                specialization: row.specialization,
                ranks: row.ranks,
                customBonus: row.customBonus
            };
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request)
            };
            const response = await fetch(`${API_TACTICAL_URL}/characters/${tacticalCharacter.id}/skills`, requestOptions);
            if (response.status === 200) {
                const responseBody = await response.json();
                setTacticalCharacter(responseBody);
                setRowModesModel({ ...rowModesModel, [skillId]: { mode: GridRowModes.View } });
            } else {
                console.error(response.status);
            }
        }
    };

    const handleDeleteClick = (id) => async () => {
        console.log(`handleDeleteClick ${JSON.stringify(id, null, 2)}`);
        const row = rows.find(e => e.id === id);
        console.log(`handleDeleteClick ${JSON.stringify(row, null, 2)}`);
        const skillId = row.skillId;
        console.log(`handleDeleteClick skillId: ${skillId}`);
        await deleteSKill(row.skillId);
    };

    const handleCancelClick = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });

        const editedRow = rows.find((row) => row.id === id);
        if (editedRow.isNew) {
            setRows(rows.filter((row) => row.id !== id));
        }
    };

    const processRowUpdate = async (newRow) => {
        console.log(`TacticalCharacterSkillDataGrid.processRowUpdate ${JSON.stringify(newRow, null, 2)}`);
        if (newRow.isNew) {
            await postNewSkill(newRow);
            return;
            // TODO REFRESH
        } else {
            //TODO
        }
        // const updatedRow = { ...newRow, isNew: false };
        // setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
        // return updatedRow;
    };

    const handleRowModesModelChange = (newRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const handleSelectSkillChange = (data, value) => {
        console.log(`TacticalCharacterSkillDataGrid.handleSelectSkillChange ${JSON.stringify(data, null, 2)} > ${value}`);
        const newId = data.newId;
        console.log(`TacticalCharacterSkillDataGrid.handleSelectSkillChange ${newId} > ${value}`);
        const updatedRows = rows.map((row) =>
            row.newId === newId ? { ...row, skillId: value } : row
        );
        setRows(updatedRows);
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [value]: { mode: GridRowModes.Edit },
        }));
    };

    const postNewSkill = async (newRow) => {
        console.log(`TacticalCharacterSkillDataGrid.postNewSkill`);
        try {
            const request = {
                skillId: newRow.skillId,
                specialization: newRow.specialization,
                ranks: newRow.ranks,
                customBonus: newRow.customBonus
            };
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request)
            };
            const response = await fetch(`${API_TACTICAL_URL}/characters/${tacticalCharacter.id}/skills`, requestOptions);
            if (response.status === 200) {
                const responseBody = await response.json();
                setTacticalCharacter(responseBody);
            } else {
                console.error(response.status);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const deleteSKill = async (skillId) => {
        console.log(`TacticalCharacterSkillDataGrid.deleteSKill ${skillId}`);
        try {
            const response = await fetch(`${API_TACTICAL_URL}/characters/${tacticalCharacter.id}/skills/${skillId}`, { method: 'DELETE' });
            if (response.status === 200) {
                const responseBody = await response.json();
                setTacticalCharacter(responseBody);
            } else {
                console.error(response.status);
            }
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        const fetchSkillCategories = async () => {
            const response = await fetch(`${API_CORE_URL}/skill-categories?size=500`);
            const data = await response.json();
            setSkillCategories(data.content);
        };
        const fetchSkills = async () => {
            const response = await fetch(`${API_CORE_URL}/skills?size=500`);
            const responseBody = await response.json();
            const translated = responseBody.content.map(e => {
                return {
                    ...e,
                    name: t(e.id)
                }
            });
            const sorted = translated.sort((a, b) => a.id.localeCompare(b.id));
            setSkills(sorted);
        };
        fetchSkillCategories();
        fetchSkills();
    }, []);

    const columns = [
        {
            field: 'skillId', headerName: 'Skill', width: 250,
            renderCell: (params) => (
                <>
                    {!params.row.skillId.startsWith('pending-select-') ? (
                        <div>{t(params.row.skillId)}</div>
                    ) : (
                        <Select
                            value={params.value}
                            fullWidth
                            onChange={(event) => handleSelectSkillChange(params.row, event.target.value)}>
                            {skills.map((option) => (
                                <MenuItem key={option.id} value={option.id}>{t(option.id)}</MenuItem>
                            ))}
                        </Select>

                    )}
                </>
            ),
        },
        { field: 'specialization', headerName: 'Specialization', type: 'text', align: 'right', width: 250, editable: true },
        { field: 'statistics', headerName: 'Statistics', type: 'text', align: 'right', width: 100, editable: false },
        { field: 'ranks', headerName: 'Ranks', type: 'text', align: 'right', width: 100, editable: true },
        { field: 'statBonus', headerName: 'Stat B', type: 'text', align: 'right', width: 100, editable: false },
        { field: 'racialBonus', headerName: 'Racial B', type: 'text', align: 'right', width: 100, editable: false },
        { field: 'developmentBonus', headerName: 'Dev B', type: 'text', align: 'right', width: 100, editable: false },
        { field: 'customBonus', headerName: 'Stat B', type: 'text', align: 'right', width: 100, editable: true },
        { field: 'totalBonus', headerName: 'Stat B', type: 'text', align: 'right', width: 100, editable: false },

        {
            field: 'role',
            headerName: 'Sample',
            width: 100,
            editable: true,
            type: 'singleSelect',
            valueOptions: ['Market', 'Finance', 'Development']
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            cellClassName: 'actions',
            getActions: ({ id }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon />}
                            label="Save"
                            sx={{
                                color: 'primary.main',
                            }}
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon />}
                            label="Cancel"
                            className="textPrimary"
                            onClick={handleCancelClick(id)}
                            color="inherit"
                        />,
                    ];
                }

                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />,
                ];
            },
        },
    ];

    return (
        <div>
            <Box
                sx={{
                    // height: 500,
                    height: '100%',
                    width: '100%',
                    '& .actions': {
                        color: 'text.secondary',
                    },
                    '& .textPrimary': {
                        color: 'text.primary',
                    },
                }}
            >
                <DataGrid
                    rows={rows}
                    columns={columns}
                    getRowId={row => row.skillId}
                    editMode="row"
                    rowModesModel={rowModesModel}
                    onRowModesModelChange={handleRowModesModelChange}
                    onRowEditStop={handleRowEditStop}
                    processRowUpdate={processRowUpdate}
                    slots={{
                        toolbar: EditToolbar,
                    }}
                    slotProps={{
                        toolbar: { setRows, setRowModesModel },
                    }}
                />
            </Box>
            <h3>rows</h3>
            <pre>
                {JSON.stringify(rows, null, 2)}
            </pre>
            <h3>rowModesModel</h3>
            <pre>
                {JSON.stringify(rowModesModel, null, 2)}
            </pre>
            <h3>tacticalCharacter.skills</h3>
            <pre>
                {JSON.stringify(tacticalCharacter.skills, null, 2)}
            </pre>
            <h3>skills</h3>
            <pre>
                {JSON.stringify(skills, null, 2)}
            </pre>
        </div>
    );
}

export default TacticalCharacterSkillDataGrid;