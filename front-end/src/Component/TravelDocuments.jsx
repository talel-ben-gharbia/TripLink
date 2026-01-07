import React, { useState, useEffect } from 'react';
import { Upload, FileText, Calendar, AlertTriangle, Trash2, Edit, CheckCircle, XCircle, Loader2, Download } from 'lucide-react';
import api from '../api';
import { useErrorToast } from './ErrorToast';
import Modal from './Modal';
import EmptyState from './EmptyState';
import { API_URL } from '../config';

const TravelDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [alerts, setAlerts] = useState({ expiring: [], expired: [] });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const { showToast, ToastContainer } = useErrorToast();

  const [formData, setFormData] = useState({
    documentType: 'PASSPORT',
    expirationDate: '',
    issueDate: '',
    country: '',
    documentNumber: '',
    file: null
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/documents');
      setDocuments(response.data.documents || []);
      setAlerts(response.data.alerts || { expiring: [], expired: [] });
    } catch (error) {
      console.error('Failed to load documents:', error);
      showToast('Failed to load documents', 'error', 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('File size must be less than 10MB', 'error', 5000);
        return;
      }
      setFormData({ ...formData, file });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      showToast('Please select a file to upload', 'warning', 3000);
      return;
    }

    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', formData.file);
      uploadData.append('data', JSON.stringify({
        documentType: formData.documentType,
        expirationDate: formData.expirationDate || null,
        issueDate: formData.issueDate || null,
        country: formData.country || null,
        documentNumber: formData.documentNumber || null,
      }));

      await api.post('/api/documents', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showToast('Document uploaded successfully!', 'success', 3000);
      setShowUploadModal(false);
      resetForm();
      loadDocuments();
    } catch (error) {
      console.error('Failed to upload document:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to upload document';
      showToast(errorMsg, 'error', 5000);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await api.delete(`/api/documents/${id}`);
      showToast('Document deleted successfully', 'success', 3000);
      loadDocuments();
    } catch (error) {
      console.error('Failed to delete document:', error);
      showToast('Failed to delete document', 'error', 5000);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/documents/${editingDoc.id}`, {
        documentType: formData.documentType,
        expirationDate: formData.expirationDate || null,
        issueDate: formData.issueDate || null,
        country: formData.country || null,
        documentNumber: formData.documentNumber || null,
      });

      showToast('Document updated successfully!', 'success', 3000);
      setEditingDoc(null);
      resetForm();
      loadDocuments();
    } catch (error) {
      console.error('Failed to update document:', error);
      showToast('Failed to update document', 'error', 5000);
    }
  };

  const resetForm = () => {
    setFormData({
      documentType: 'PASSPORT',
      expirationDate: '',
      issueDate: '',
      country: '',
      documentNumber: '',
      file: null
    });
  };

  const openEditModal = (doc) => {
    setEditingDoc(doc);
    setFormData({
      documentType: doc.documentType,
      expirationDate: doc.expirationDate || '',
      issueDate: doc.issueDate || '',
      country: doc.country || '',
      documentNumber: doc.documentNumber || '',
      file: null
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getDocumentTypeLabel = (type) => {
    const labels = {
      PASSPORT: 'Passport',
      VISA: 'Visa',
      ID_CARD: 'ID Card',
      DRIVER_LICENSE: 'Driver License'
    };
    return labels[type] || type;
  };

  return (
    <>
      <ToastContainer />
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText size={28} className="text-purple-600" />
              Travel Documents
            </h3>
            <p className="text-gray-600 mt-1">Manage your passports, visas, and travel documents</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingDoc(null);
              setShowUploadModal(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition font-semibold flex items-center gap-2"
          >
            <Upload size={20} />
            Upload Document
          </button>
        </div>

        {/* Alerts */}
        {(alerts.expired?.length > 0 || alerts.expiring?.length > 0) && (
          <div className="mb-6 space-y-3">
            {alerts.expired?.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="text-red-600" size={20} />
                  <h4 className="font-semibold text-red-900">Expired Documents ({alerts.expired.length})</h4>
                </div>
                <p className="text-sm text-red-700">You have expired documents that need renewal.</p>
              </div>
            )}
            {alerts.expiring?.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="text-yellow-600" size={20} />
                  <h4 className="font-semibold text-yellow-900">Expiring Soon ({alerts.expiring.length})</h4>
                </div>
                <p className="text-sm text-yellow-700">Some documents will expire within 90 days.</p>
              </div>
            )}
          </div>
        )}

        {/* Documents List */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="mx-auto animate-spin text-purple-600" size={48} />
            <p className="mt-2 text-gray-600">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Documents Yet"
            message="Upload your travel documents (passport, visa, etc.) for easy access and automatic expiration tracking."
            actionLabel="Upload Document"
            actionOnClick={() => setShowUploadModal(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={`border rounded-lg p-4 ${
                  doc.isExpired
                    ? 'bg-red-50 border-red-200'
                    : doc.isExpiringSoon
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="text-purple-600" size={20} />
                      <h4 className="font-semibold text-gray-900">{getDocumentTypeLabel(doc.documentType)}</h4>
                      {doc.isVerified && (
                        <CheckCircle className="text-green-600" size={16} />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{doc.fileName}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatFileSize(doc.fileSize)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(doc)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {doc.documentNumber && (
                  <p className="text-xs text-gray-600 mb-2">
                    <span className="font-medium">Number:</span> {doc.documentNumber}
                  </p>
                )}

                {doc.expirationDate && (
                  <div className="flex items-center gap-2 text-xs mb-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span className={doc.isExpired ? 'text-red-600 font-semibold' : doc.isExpiringSoon ? 'text-yellow-600 font-semibold' : 'text-gray-600'}>
                      Expires: {new Date(doc.expirationDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {doc.country && (
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Country:</span> {doc.country}
                  </p>
                )}

                <a
                  href={`${API_URL}${doc.filePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 transition"
                >
                  <Download size={14} />
                  View Document
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          resetForm();
        }}
        title="Upload Travel Document"
        size="md"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Document Type *</label>
            <select
              value={formData.documentType}
              onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="PASSPORT">Passport</option>
              <option value="VISA">Visa</option>
              <option value="ID_CARD">ID Card</option>
              <option value="DRIVER_LICENSE">Driver License</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">File * (JPEG, PNG, or PDF, max 10MB)</label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            {formData.file && (
              <p className="text-sm text-gray-600 mt-1">{formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Document Number</label>
            <input
              type="text"
              value={formData.documentNumber}
              onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
              placeholder="e.g., A12345678"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date</label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expiration Date</label>
              <input
                type="date"
                value={formData.expirationDate}
                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="e.g., United States"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={uploading || !formData.file}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Upload Document
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowUploadModal(false);
                resetForm();
              }}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingDoc}
        onClose={() => {
          setEditingDoc(null);
          resetForm();
        }}
        title="Edit Document"
        size="md"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Document Type *</label>
            <select
              value={formData.documentType}
              onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="PASSPORT">Passport</option>
              <option value="VISA">Visa</option>
              <option value="ID_CARD">ID Card</option>
              <option value="DRIVER_LICENSE">Driver License</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Document Number</label>
            <input
              type="text"
              value={formData.documentNumber}
              onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
              placeholder="e.g., A12345678"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date</label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expiration Date</label>
              <input
                type="date"
                value={formData.expirationDate}
                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="e.g., United States"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition font-semibold"
            >
              Update Document
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingDoc(null);
                resetForm();
              }}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default TravelDocuments;

