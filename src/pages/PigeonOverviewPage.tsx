import React from 'react';
import { useAuth } from '../contexts/useAuth';
import { usePigeonOverviewLogic } from '../hooks/usePigeonOverviewLogic';
import LoadingSpinner from '../components/LoadingSpinner';
import PigeonCard from '../components/PigeonCard';
import PigeonListItem from '../components/PigeonListItem';
import PigeonFilterPanel from '../components/PigeonFilterPanel';
import { Grid, List, Filter, Search, Heart, X } from 'lucide-react';
import type { User } from '../types/pigeon';

const PigeonOverviewMain: React.FC<{ user: User }> = ({ user }) => {
  const logic = usePigeonOverviewLogic(user);

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search pigeons..."
              value={logic.searchTerm}
              onChange={(e) => logic.setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          {/* Group Selection */}
          <div className="flex items-center space-x-2">
            <select
              value={logic.selectedGroup?.id || ''}
              onChange={(e) => {
                const groupId = e.target.value;
                const group = logic.userGroups.find(g => g.id === groupId);
                logic.setSelectedGroup(group || null);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Pigeons</option>
              {logic.userGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name} ({group.description ? group.description.substring(0, 20) + '...' : 'No description'})
                </option>
              ))}
            </select>
            {logic.selectedGroup && (
              <button
                onClick={() => logic.setSelectedGroup(null)}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Clear group filter"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {/* Filter Toggle */}
          <button
            onClick={() => logic.setShowFilters(!logic.showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>
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
      {/* Breeding Modal */}
      {logic.showBreedingModal && logic.selectedPigeon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Breeding Center</h2>
              <button
                onClick={() => logic.setShowBreedingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {/* Selected Pigeon */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Selected Pigeon</h3>
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <img src={logic.getPigeonPicture(logic.selectedPigeon)} alt="Pigeon" className="w-16 h-16 object-cover" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{logic.selectedPigeon.name}</h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${logic.selectedPigeon.gender === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                      {logic.selectedPigeon.gender === 'male' ? '♂' : '♀'}
                    </span>
                    <span>Age: {logic.formatAge(logic.selectedPigeon.age_years, logic.selectedPigeon.age_months, logic.selectedPigeon.age_days)}</span>
                    <span>Fertility: {logic.selectedPigeon.fertility.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Breeding Partners */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Select Breeding Partner</h3>
              {logic.breedingPartners.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Heart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No compatible breeding partners found.</p>
                  <p className="text-sm">Partners must be opposite gender, at least 1 year old, and have fertility above 50.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                  {logic.breedingPartners.map((partner) => (
                    <div
                      key={partner.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${logic.selectedPartner?.id === partner.id ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-gray-300'}`}
                      onClick={() => logic.setSelectedPartner(partner)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <img src={logic.getPigeonPicture(partner)} alt="Pigeon" className="w-12 h-12 object-cover" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{partner.name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${partner.gender === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                              {partner.gender === 'male' ? '♂' : '♀'}
                            </span>
                            <span>Fertility: {partner.fertility.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Breeding Action */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => logic.setShowBreedingModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={logic.handleBreeding}
                disabled={!logic.selectedPartner || logic.breedingLoading}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {logic.breedingLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Breeding...</span>
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4" />
                    <span>Start Breeding</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {logic.showSaveGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Save Group</h2>
            <label className="block mb-2 text-sm font-medium">Group Name</label>
            <input
              type="text"
              value={logic.groupName}
              onChange={e => logic.setGroupName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded mb-4"
              maxLength={32}
            />
            <label className="block mb-2 text-sm font-medium">Description (optional)</label>
            <textarea
              value={logic.groupDescription}
              onChange={e => logic.setGroupDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded mb-4"
              maxLength={128}
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                onClick={() => logic.setShowSaveGroupModal(false)}
                disabled={logic.savingGroup}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                onClick={logic.handleSaveGroup}
                disabled={logic.savingGroup || !logic.groupName.trim() || logic.selectedPigeonIds.length === 0}
              >
                {logic.savingGroup ? 'Saving...' : 'Save Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PigeonOverviewPage: React.FC = () => {
  const { gameUser, loading } = useAuth();
  if (loading) {
    return <LoadingSpinner />;
  }
  if (!gameUser) {
    return <div className="text-center py-12 text-red-600">You must be logged in to view this page.</div>;
  }
  return <PigeonOverviewMain user={gameUser} />;
};

export default PigeonOverviewPage; 