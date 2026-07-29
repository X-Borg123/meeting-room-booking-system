import { ROLE_CONFIG } from '../../lib/constants'

const RoleBadge = ({ role }) => {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.user

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${config.color}`}
    >
      {config.label}
    </span>
  )
}

export default RoleBadge
