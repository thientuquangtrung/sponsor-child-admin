import React, { useState, useEffect } from 'react';
import {
    Search,
    FileText,
    MoreVertical,
    Calendar,
    Users,
    MapPin,
    Trash2,
    Minus,
} from 'lucide-react';
import { format } from 'date-fns';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Breadcrumb from '@/pages/admin/Breadcrumb';
import { useNavigate } from 'react-router-dom';

const MOCK_VISITS = [
    {
        id: 1,
        visitName: "Chuyến thăm trẻ em Hà Nội",
        provinceId: 1,
        provinceName: "Hà Nội",
        startTime: new Date('2024-10-15T09:00:00'),
        endTime: new Date('2024-11-15T19:00:00'),
        numberOfVisitors: 3,
        visitCost: 500000,
        description: "Thăm và tặng quà cho trẻ em",
        status: 'pending',
    },
    {
        id: 2,
        visitName: "Chuyến thăm trẻ em Hà Nội",
        provinceId: 1,
        provinceName: "Hà Nội",
        startTime: new Date('2024-10-15T09:00:00'),
        endTime: new Date('2024-11-15T19:00:00'),
        numberOfVisitors: 3,
        visitCost: 500000,
        description: "Thăm và tặng quà cho trẻ em",
        status: 'pending',
    }, {
        id: 3,
        visitName: "Chuyến thăm trẻ em Hà Nội",
        provinceId: 1,
        provinceName: "Hà Nội",
        startTime: new Date('2024-10-15T09:00:00'),
        endTime: new Date('2024-11-15T19:00:00'),
        numberOfVisitors: 3,
        visitCost: 500000,
        description: "Thăm và tặng quà cho trẻ em",
        status: 'pending',
    }, {
        id: 4,
        visitName: "Chuyến thăm trẻ em Hà Nội",
        provinceId: 1,
        provinceName: "Hà Nội",
        startTime: new Date('2024-10-15T09:00:00'),
        endTime: new Date('2024-11-15T19:00:00'),
        numberOfVisitors: 3,
        visitCost: 500000,
        description: "Thăm và tặng quà cho trẻ em",
        status: 'pending',
    },
];

const PROVINCES = [
    { id: 1, name: "Hà Nội" },
    { id: 2, name: "TP.HCM" },
];

const VISIT_STATUS = {
    pending: { label: 'Chờ thực hiện', color: 'bg-blue-500' },
    completed: { label: 'Hoàn thành', color: 'bg-green-500' },
};

const Visit = () => {
    const navigate = useNavigate();
    const [visits, setVisits] = useState(MOCK_VISITS);
    const [filteredVisits, setFilteredVisits] = useState(visits);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedProvince, setSelectedProvince] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        filterVisits();
    }, [selectedStatus, selectedProvince, searchTerm, visits]);

    const filterVisits = () => {
        let filtered = [...visits];

        if (selectedStatus !== 'all') {
            filtered = filtered.filter(visit => visit.status === selectedStatus);
        }

        if (selectedProvince !== 'all') {
            filtered = filtered.filter(visit => visit.provinceId.toString() === selectedProvince);
        }

        if (searchTerm) {
            const normalizedSearchTerm = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            filtered = filtered.filter(visit =>
                visit.visitName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(normalizedSearchTerm)
            );
        }

        setFilteredVisits(filtered);
    };

    const handleStatusChange = async (visitId) => {
        try {
            setVisits(visits.map(visit =>
                visit.id === visitId
                    ? { ...visit, status: 'completed' }
                    : visit
            ));
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleDeleteVisit = (visitId) => {
        setVisits(visits.filter(visit => visit.id !== visitId));
    };

    return (
        <>      <Breadcrumb pageName="Chuyến thăm" />

            <div className="p-6 space-y-6">


                <div className="grid grid-cols-1 md:grid-cols-4 gap-4  p-6 rounded-lg shadow-sm">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Tìm kiếm theo tên chuyến thăm..."
                            className="pl-10 border-b-4 border-[#25a5a7] "
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4 md:col-span-2">

                        <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                            <SelectTrigger className="border-b-4 border-[#25a5a7] max-w-40">
                                <SelectValue placeholder="Chọn tỉnh/thành" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả tỉnh/thành</SelectItem>
                                {PROVINCES.map((province) => (
                                    <SelectItem key={province.id} value={province.id.toString()}>
                                        {province.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="border-b-4 border-[#25a5a7] max-w-40">
                                <SelectValue placeholder="Lọc theo trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                {Object.entries(VISIT_STATUS).map(([key, { label }]) => (
                                    <SelectItem key={key} value={key}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end">
                        <Button
                            className="mr-2 mt-3 border-2 border-[#25a5a7] bg-transparent text-[#25a5a7] hover:bg-[#25a5a7] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600"
                            onClick={() => navigate('add-visit-form')}
                        >
                            Tạo chuyến thăm
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVisits.map((visit) => (
                        <Card key={visit.id} className="hover:shadow-md transition-shadow duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-semibold text-gray-800">
                                        {visit.visitName}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-1 text-sm text-gray-500">
                                        <Calendar className="h-4 w-4 text-blue-500" />
                                        {format(visit.startTime, 'dd/MM/yyyy')}<Minus /><span>{format(visit.endTime, 'dd/MM/yyyy')}</span>

                                    </CardDescription>
                                </div>
                                <Badge className={`${VISIT_STATUS[visit.status].color} text-white`}>
                                    {VISIT_STATUS[visit.status].label}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <MapPin className="h-4 w-4 fill-yellow-300" />
                                            <span>{visit.provinceName}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Users className="h-4 w-4 fill-purple-500" />
                                            <span>{visit.numberOfVisitors} người thăm</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2">{visit.description}</p>
                                    </div>

                                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                        <span className='font-medium'>    Tổng chi phí chuyến thăm:</span>
                                        <span className="font-medium text-green-500">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                                                .format(visit.visitCost)}
                                        </span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {visit.status === 'pending' && (
                                                    <DropdownMenuItem
                                                        onClick={() => handleStatusChange(visit.id)}
                                                        className="text-[#25a5a7]"
                                                    >
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        Hoàn thành chuyến thăm
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem
                                                    onClick={() => handleDeleteVisit(visit.id)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Xóa chuyến thăm
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>


            </div>
        </>
    );
};

export default Visit;