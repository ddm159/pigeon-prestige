import React, { useState } from 'react';
import { useAuth } from '../contexts/useAuth';
import { usePigeonOverviewLogic } from '../hooks/usePigeonOverviewLogic';
import PigeonCard from '../components/PigeonCard';
import PigeonListItem from '../components/PigeonListItem';
import PigeonFilterPanel from '../components/PigeonFilterPanel';
import BreedingModal from '../components/BreedingModal';
import SaveGroupModal from '../components/SaveGroupModal';
import AliasEditModal from '../components/AliasEditModal';
import { Grid, List } from 'lucide-react';
import type { User, Pigeon } from '../types/pigeon';
import PigeonSearchAndFilterBar from '../components/PigeonSearchAndFilterBar';
import { pigeonService } from '../services/pigeonService';

const PigeonOverviewMain: React.FC<{ user: User }> = ({ user }) => {
  const logic = usePigeonOverviewLogic(user);
  const [aliasModalOpen, setAliasModalOpen] = useState(false);
  const [selectedPigeonForAlias, setSelectedPigeonForAlias] = useState<Pigeon | null>(null);

  const handleEditAlias = (pigeon: Pigeon) => {
    setSelectedPigeonForAlias(pigeon);
    setAliasModalOpen(true);
  };

  const handleSaveAlias = async (pigeonId: string, alias: string | null) => {
    await pigeonService.updatePigeonAlias(pigeonId, alias);
    // Refresh the pigeon list
    await logic.refreshPigeons();
  };
      
  if (logic.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  if (!user) {
    return <div className="text-center py-12 text-red-600">You must be logged in to view this page.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pigeon Overview</h1>
          <p className="text-gray-600">Manage your {logic.pigeons.length} pigeons</p>
        </div>
        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <button
            onClick={() => logic.setViewMode('grid')}
            className={`p-2 rounded-lg ${logic.viewMode === 'grid' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => logic.setViewMode('list')}
            className={`p-2 rounded-lg ${logic.viewMode === 'list' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>
      {/* Search and Filters */}
      <div className="card">
        <PigeonSearchAndFilterBar
          searchTerm={logic.searchTerm}
          onSearchTermChange={logic.setSearchTerm}
          userGroups={logic.userGroups}
          selectedGroup={logic.selectedGroup}
          onGroupChange={logic.setSelectedGroup}
          onToggleFilters={() => logic.setShowFilters(!logic.showFilters)}
        />
        {logic.showFilters && (
          <PigeonFilterPanel
            showAdvancedFilters={false}
            filters={logic.filters}
            setFilters={logic.setFilters}
            selectedGroup={logic.selectedGroup}
            setSelectedGroup={logic.setSelectedGroup}
          />
        )}
      </div>
      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {logic.filteredPigeons.length} of {logic.pigeons.length} pigeons
        </p>
      </div>
      {logic.selectedPigeonIds.length > 0 && (
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          onClick={() => logic.setShowSaveGroupModal(true)}
          disabled={logic.userGroups.length >= 20}
        >
          Save as Group
        </button>
      )}
      {/* Pigeon Grid/List */}
      {logic.filteredPigeons.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🐦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pigeons found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className={logic.viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {logic.filteredPigeons.map((pigeon) => (
            logic.viewMode === 'grid' ? (
                              <PigeonCard
                  key={pigeon.id}
                  pigeon={pigeon}
                  selected={logic.selectedPigeonIds.includes(pigeon.id)}
                  onSelect={logic.handleSelectPigeon}
                  onBreed={logic.handleBreedingClick}
                  onDelete={logic.handleDeletePigeon}
                  onEditAlias={handleEditAlias}
                />
            ) : (
              <PigeonListItem
                key={pigeon.id}
                pigeon={pigeon}
                selected={logic.selectedPigeonIds.includes(pigeon.id)}
                onSelect={logic.handleSelectPigeon}
                onBreed={logic.handleBreedingClick}
                onDelete={logic.handleDeletePigeon}
              />
            )
          ))}
        </div>
      )}
      <BreedingModal
        open={logic.showBreedingModal && !!logic.selectedPigeon}
        onClose={() => logic.setShowBreedingModal(false)}
        selectedPigeon={logic.selectedPigeon!}
        breedingPartners={logic.breedingPartners}
        selectedPartner={logic.selectedPartner}
        onSelectPartner={logic.setSelectedPartner}
        onBreed={logic.handleBreeding}
        breedingLoading={logic.breedingLoading}
        getPigeonPicture={logic.getPigeonPicture}
      />
      <SaveGroupModal
        open={logic.showSaveGroupModal}
        groupName={logic.groupName}
        groupDescription={logic.groupDescription}
        onGroupNameChange={logic.setGroupName}
        onGroupDescriptionChange={logic.setGroupDescription}
        onCancel={() => logic.setShowSaveGroupModal(false)}
        onSave={logic.handleSaveGroup}
        saving={logic.savingGroup}
        canSave={!!logic.groupName.trim() && logic.selectedPigeonIds.length > 0 && !logic.savingGroup}
      />
      
      {/* Alias Edit Modal */}
      <AliasEditModal
        open={aliasModalOpen}
        pigeon={selectedPigeonForAlias}
        onClose={() => setAliasModalOpen(false)}
        onSave={handleSaveAlias}
      />
    </div>
  );
};

const PigeonOverviewPage: React.FC = () => {
  const { user, gameUser, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  if (user && !gameUser) {
    return <div className="text-center py-12 text-blue-600">Loading your profile...</div>;
  }
  if (!user || !gameUser) {
    return <div className="text-center py-12 text-red-600">You must be logged in to view this page.</div>;
  }
  return <PigeonOverviewMain user={gameUser} />;
};

export default PigeonOverviewPage; 