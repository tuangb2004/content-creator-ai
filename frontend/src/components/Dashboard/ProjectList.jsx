/**
 * Dashboard ProjectList - Uses the enhanced Projects/ProjectList component
 */

import ProjectListComponent from '../Projects/ProjectList';

const ProjectList = ({ items = [], onRemoveItem, highlightedProjectId, onViewProjects }) => {
  return (
    <ProjectListComponent
      items={items}
      onRemoveItem={onRemoveItem}
      highlightedProjectId={highlightedProjectId}
    />
  );
};

export default ProjectList;
