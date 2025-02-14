import ConfirmModal from './ConfirmModal'
import getRoleNiceName from './helpers/get-role-nice-name'

export default function ChangeUserRoleModal ({
  user,
  organization,
  role,
  onChange = () => {},
  onCancel = () => {},
}) {
  const onClickChange = () => {
    let url;

    if (role === 'admin') {
      url = `/organizations/${organization.id}/users/${user.id}/makeAdmin`
    } else if (role === 'member') {
      url = `/organizations/${organization.id}/users/${user.id}/makeMember`
    } else {
      throw new Error(`Invalid role: "${role}"`)
    }

    fetch(url, {
      method: 'POST',
    })
      .then(onChange)
      .catch(console.error)
  }

  return (
    <ConfirmModal
      text={(<span>Are you sure you want to change the role of <strong>{user.displayName}</strong> to <strong>{getRoleNiceName(role)}</strong>?</span>)}
      okText={role === 'admin' ? 'Make admin' : 'Make member'}
      onClickCancel={onCancel}
      onClickOK={onClickChange}
    />
  )
}
