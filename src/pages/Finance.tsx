import { Plus } from 'lucide-react';
import { useState } from 'react';

import { PageContainer } from '@/components/shared/PageContainer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BudgetFormDialog,
  BudgetsGrid,
  FinanceOverview,
  TransactionFilterBar,
  TransactionFormDialog,
  TransactionsList,
} from '@/features/finance';
import {
  DEFAULT_TRANSACTION_FILTERS,
  type TransactionFilters,
} from '@/features/finance/types';

export function Finance() {
  const [filters, setFilters] = useState<TransactionFilters>(
    DEFAULT_TRANSACTION_FILTERS,
  );
  const [transactionFormOpen, setTransactionFormOpen] = useState(false);
  const [budgetFormOpen, setBudgetFormOpen] = useState(false);

  return (
    <PageContainer size="lg" className="gap-4 flex flex-col">
      <h2 className="font-semibold text-h2 text-foreground">Finance</h2>

      <FinanceOverview />

      <Tabs defaultValue="transactions">
        <TabsList className="sm:w-fit w-full overflow-x-auto">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="gap-4 flex flex-col">
          <div className="gap-3 flex items-center justify-between">
            <TransactionFilterBar filters={filters} onChange={setFilters} />
            <Button size="sm" onClick={() => setTransactionFormOpen(true)}>
              <Plus aria-hidden="true" />
              New
            </Button>
          </div>
          <TransactionsList
            filters={filters}
            onCreate={() => setTransactionFormOpen(true)}
          />
          <TransactionFormDialog
            open={transactionFormOpen}
            onOpenChange={setTransactionFormOpen}
          />
        </TabsContent>

        <TabsContent value="budgets" className="gap-4 flex flex-col">
          <div className="flex items-center justify-end">
            <Button size="sm" onClick={() => setBudgetFormOpen(true)}>
              <Plus aria-hidden="true" />
              New budget
            </Button>
          </div>
          <BudgetsGrid onCreate={() => setBudgetFormOpen(true)} />
          <BudgetFormDialog
            open={budgetFormOpen}
            onOpenChange={setBudgetFormOpen}
          />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
