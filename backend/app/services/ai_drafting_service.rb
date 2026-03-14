class AiDraftingService
  def initialize(role, volunteer)
    @role = role
    @volunteer = volunteer
  end

  def call
    shared_skills = (@role.skills & @volunteer.skills).map(&:name)
    skills_text = shared_skills.any? ? shared_skills.join(', ') : "general"
    
    "Draft a short, friendly WhatsApp message to #{@volunteer.first_name} asking if they can help with the '#{@role.title}' role. Mention that their skills in #{skills_text} would be incredibly helpful. The role description is: '#{@role.description}'. Keep it casual and under 50 words."
  end
end
