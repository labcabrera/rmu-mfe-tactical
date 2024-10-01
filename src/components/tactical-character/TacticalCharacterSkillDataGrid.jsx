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

//TODO remove and uninstall
import { randomId } from '@mui/x-data-grid-generator';

import { API_CORE_URL } from "../../constants/environment";

const roles = ['Market', 'Finance', 'Development'];

function EditToolbar(props) {
    const { setRows, setRowModesModel } = props;

    const handleClick = () => {
        const id = randomId();
        setRows((oldRows) => [
            ...oldRows,
            { id, name: '', age: '', role: '', isNew: true },
        ]);
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
        }));
    };

    return (
        <GridToolbarContainer>
            <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
                Add record
            </Button>
        </GridToolbarContainer>
    );
}

const TacticalCharacterSkillDataGrid = ({ tacticalCharacter }) => {

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

    const handleSaveClick = (id) => () => {
        console.log(`handleSaveClick ${JSON.stringify(id, null, 2)}`);
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    };

    const handleDeleteClick = (id) => () => {
        console.log(`handleDeleteClick ${JSON.stringify(id, null, 2)}`);
        setRows(rows.filter((row) => row.id !== id));
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

    const processRowUpdate = (newRow) => {
        console.log(`processRowUpdate ${JSON.stringify(newRow, null, 2)}`);
        const updatedRow = { ...newRow, isNew: false };
        setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
        return updatedRow;
    };

    const handleRowModesModelChange = (newRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const handleSelectCategoryChange = (id, value) => {
        const updatedRows = rows.map((row) =>
            row.id === id ? { ...row, category: value } : row
        );
        setRows(updatedRows);
    };

    const handleSelectSkillChange = (id, value) => {
        const updatedRows = rows.map((row) =>
            row.id === id ? { ...row, skillId: value } : row
        );
        setRows(updatedRows);
    };

    useEffect(() => {
        const fetchSkillCategories = async () => {
            const response = await fetch(`${API_CORE_URL}/skill-categories?size=500`);
            const data = await response.json();
            setSkillCategories(data.content);
        };
        const fetchSkills = async () => {
            const response = await fetch(`${API_CORE_URL}/skills?size=500`);
            const data = await response.json();
            setSkills(data.content);
        };
        fetchSkillCategories();
        fetchSkills();
    }, []);

    const columns = [
        // { field: 'skillId', headerName: 'Skill', width: 160, editable: true },
        { field: 'skillId', headerName: 'Skill', width: 160,
            renderCell: (params) => (
                <Select
                    value={params.value}
                    fullWidth
                    variant='standard'
                    onChange={(event) => handleSelectSkillChange(params.id, event.target.value)}>
                    {skills.map((option) => (
                        <MenuItem key={option.id} value={option.id}>{t(option.id)}</MenuItem>
                    ))}
                </Select>
            ),
        },
        {
            field: 'skillCategoryId', headerName: 'Category', width: 160,
            renderCell: (params) => (
                <Select
                    value={params.value}
                    fullWidth
                    variant='standard'
                    onChange={(event) => handleSelectCategoryChange(params.id, event.target.value)}>
                    {skillCategories.map((option) => (
                        <MenuItem key={option.id} value={option.id}>{t(option.id)}</MenuItem>
                    ))}
                </Select>
            ),
        },
        { field: 'attributeBonus', headerName: 'Attributes', type: 'number', align: 'right', width: 100, editable: true },
        { field: 'racialBonus', headerName: 'Racial', type: 'number', align: 'right', width: 100, editable: true },
        { field: 'customBonus', headerName: 'Custom', type: 'number', align: 'right', width: 100, editable: true },
        { field: 'totalBonus', headerName: 'Total', type: 'number', align: 'right', width: 100, editable: false },
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
                    height: 500,
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
            <h3>formData</h3>
            <pre>
                {JSON.stringify(tacticalCharacter.skills, null, 2)}
            </pre>
        </div>
    );
}

export default TacticalCharacterSkillDataGrid;