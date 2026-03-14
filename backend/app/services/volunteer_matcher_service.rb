class VolunteerMatcherService
  def initialize(role)
    @role = role
  end

  def call
    return Volunteer.none if @role.skills.empty?

    # Find volunteers with at least one matching skill
    # Order by the number of matching skills (highest match percentage first)
    # Prevent N+1 queries by including skills and availabilities
    Volunteer.joins(:skills)
             .where(skills: { id: @role.skill_ids })
             .select('volunteers.*, COUNT(skills.id) AS matching_skills_count')
             .group('volunteers.id')
             .order('matching_skills_count DESC')
             .includes(:skills, :availabilities)
  end
end
