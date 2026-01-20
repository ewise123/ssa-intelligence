import { SectionStatus } from '../../types.js';
import { StatusPill } from '../../components/StatusPill.js';

void SectionStatus;
console.log(StatusPill({ status: 'completed_with_errors', size: 'sm' } as any));
