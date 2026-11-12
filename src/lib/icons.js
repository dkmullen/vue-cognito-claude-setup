// Only the @mdi/js icons this app (and Vuetify's built-in components) actually
// need. Vuetify looks icons up by alias name (e.g. `dropdown` for v-select's
// arrow); each alias is mapped here to a single SVG path, so no icon font is
// shipped and unused icons are tree-shaken out.
//
// To add an icon: import the path from @mdi/js and use it from components as
// `svg:${mdiSomething}` (or add an alias below for a Vuetify internal name).
import {
  mdiAlert,
  mdiAlertCircle,
  mdiCancel,
  mdiCheckCircle,
  mdiCheckboxBlankOutline,
  mdiCheckboxMarked,
  mdiChevronDown,
  mdiChevronLeft,
  mdiChevronRight,
  mdiChevronUp,
  mdiClose,
  mdiInformation,
  mdiLoading,
  mdiMenu,
  mdiMenuDown,
  mdiMinusBox,
  mdiRadioboxBlank,
  mdiRadioboxMarked,
} from '@mdi/js'

const svg = (path) => `svg:${path}`

export const iconAliases = {
  // Dropdowns (v-select, v-autocomplete) and expansion
  dropdown: svg(mdiMenuDown),
  subgroup: svg(mdiMenuDown),
  expand: svg(mdiChevronDown),
  collapse: svg(mdiChevronUp),
  treeviewExpand: svg(mdiChevronRight),
  treeviewCollapse: svg(mdiChevronDown),
  tableGroupExpand: svg(mdiChevronRight),
  tableGroupCollapse: svg(mdiChevronDown),

  // Navigation
  menu: svg(mdiMenu),
  prev: svg(mdiChevronLeft),
  next: svg(mdiChevronRight),

  // Close / clear
  close: svg(mdiClose),
  clear: svg(mdiClose),

  // Selection controls
  checkboxOn: svg(mdiCheckboxMarked),
  checkboxOff: svg(mdiCheckboxBlankOutline),
  checkboxIndeterminate: svg(mdiMinusBox),
  radioOn: svg(mdiRadioboxMarked),
  radioOff: svg(mdiRadioboxBlank),

  // Feedback / status
  complete: svg(mdiCheckCircle),
  success: svg(mdiCheckCircle),
  cancel: svg(mdiCancel),
  error: svg(mdiAlertCircle),
  warning: svg(mdiAlert),
  info: svg(mdiInformation),
  loading: svg(mdiLoading),
}
