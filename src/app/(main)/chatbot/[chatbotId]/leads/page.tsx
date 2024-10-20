'use client';

import React, { useState, useEffect } from 'react';
import { getLeads, deleteLead } from '@/lib/queries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useModal } from '@/providers/modal-provider';
import { useToast } from '@/components/ui/use-toast';
import { CSVLink } from 'react-csv';
import { ChevronDown, ChevronUp, Edit, Trash, UserCircle } from 'lucide-react';
import Pagination from '@/components/pagination';
import CustomModal from '@/components/global/custom-modal';
import EditLeadForm from './edit-lead-form';
import BlurPage from '@/components/global/blur-page';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState<string[]>([]); // Define expandedRows state
  const { setOpen } = useModal();
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, [currentPage, searchQuery]);

  const fetchLeads = async () => {
    const { leads, totalLeads } = await getLeads(rowsPerPage, (currentPage - 1) * rowsPerPage, searchQuery);
    setLeads(leads);
    setTotalLeads(totalLeads);
  };

  const handleDelete = async (id: string) => {
    await deleteLead(id);
    toast({ title: 'Lead deleted successfully!' });
    fetchLeads();
  };

  const handleEdit = (lead) => {
    setOpen(
      <CustomModal subheading="You can update lead information, including their quality rating." title="Edit Lead Details">
        <EditLeadForm lead={lead} onClose={() => setOpen(null)} />
      </CustomModal>
    );
  };

  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]));
  };

  const totalPages = Math.ceil(totalLeads / rowsPerPage);

  return (
    <BlurPage>
      <div className="p-4">
        {/* Search and Export Bar */}
        <div className="flex justify-between mb-6">
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-1/3"
          />
          <Button>
            <CSVLink data={leads} filename={`leads-page-${currentPage}.csv`}>
              Export CSV
            </CSVLink>
          </Button>
        </div>

        {/* Leads Table */}
        <div className="border bg-background rounded-lg">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Quality</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <React.Fragment key={lead.id}>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserCircle className="w-5 h-5 text-muted-foreground" />
                        {lead.name}
                      </div>
                    </TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded ${
                          lead.leadQuality === 'GOOD'
                            ? 'bg-green-100 text-green-600'
                            : lead.leadQuality === 'BAD'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-yellow-100 text-yellow-600'
                        }`}
                      >
                        {lead.leadQuality}
                      </span>
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      {/* Expand/Collapse Row for Showing Responses */}
                      <Button size="sm" variant="ghost" onClick={() => toggleRowExpansion(lead.id)}>
                        {expandedRows.includes(lead.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </Button>

                      {/* Edit Lead */}
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(lead)}>
                        <Edit size={16} />
                      </Button>

                      {/* Delete Lead with Confirmation */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-red-600">
                            <Trash size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>Delete Lead</AlertDialogHeader>
                          <p>Are you sure you want to delete this lead?</p>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(lead.id)}>Confirm</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Row for Showing Lead Responses */}
                  {expandedRows.includes(lead.id) && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <div className="p-4 bg-gray-50 rounded-md">
                          <h4 className="text-lg font-bold mb-2">Customer Responses</h4>
                          {lead.responses.length > 0 ? (
                            lead.responses.map((response) => (
                              <div key={response.id} className="mb-2">
                                <p className="font-semibold">Q: {response.question}</p>
                                <p>A: {response.responseText}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted-foreground">No responses available.</p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
              {!leads.length && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No leads found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </BlurPage>
  );
};

export default LeadsPage;
