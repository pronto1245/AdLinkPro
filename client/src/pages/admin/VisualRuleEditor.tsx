import React, { useState, useCallback, useRef } from 'react';
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Plus, Save, Play, Eye, History, Settings, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SortableItem from '@/components/ui/SortableItem';
import { apiRequest } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Rule types and conditions
const RULE_TYPES = [
  { id: 'ip_block', name: 'IP Block', description: 'Block specific IP addresses', color: 'red' },
  { id: 'country_block', name: 'Country Block', description: 'Block traffic from specific countries', color: 'orange' },
  { id: 'user_agent_block', name: 'User Agent Block', description: 'Block specific user agents/bots', color: 'yellow' },
  { id: 'rate_limit', name: 'Rate Limit', description: 'Limit clicks from same source', color: 'blue' },
  { id: 'conversion_rate', name: 'Conversion Rate', description: 'Block abnormal conversion rates', color: 'purple' },
  { id: 'device_fingerprint', name: 'Device Fingerprint', description: 'Block suspicious device patterns', color: 'green' },
  { id: 'behavioral', name: 'Behavioral', description: 'Block based on user behavior', color: 'indigo' }
];

const CONDITION_OPERATORS = [
  { id: 'equals', name: 'Equals', symbol: '=' },
  { id: 'not_equals', name: 'Not Equals', symbol: '≠' },
  { id: 'greater_than', name: 'Greater Than', symbol: '>' },
  { id: 'less_than', name: 'Less Than', symbol: '<' },
  { id: 'contains', name: 'Contains', symbol: '∋' },
  { id: 'not_contains', name: 'Not Contains', symbol: '∌' },
  { id: 'regex', name: 'Regex', symbol: '~' },
  { id: 'in_list', name: 'In List', symbol: '∈' }
];

const ACTION_TYPES = [
  { id: 'block', name: 'Block Traffic', description: 'Block the click/conversion', color: 'red' },
  { id: 'flag', name: 'Flag for Review', description: 'Mark for manual review', color: 'yellow' },
  { id: 'score', name: 'Add Risk Score', description: 'Add points to risk score', color: 'orange' },
  { id: 'notify', name: 'Send Notification', description: 'Send alert notification', color: 'blue' },
  { id: 'redirect', name: 'Redirect', description: 'Redirect to different URL', color: 'green' },
  { id: 'track', name: 'Enhanced Tracking', description: 'Add additional tracking', color: 'purple' }
];

interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
  logic?: 'AND' | 'OR';
}

interface Action {
  id: string;
  type: string;
  params: Record<string, any>;
}

interface FraudRule {
  id: string;
  name: string;
  type: string;
  priority: number;
  isActive: boolean;
  conditions: Condition[];
  actions: Action[];
  description?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

interface RuleTest {
  input: Record<string, any>;
  expectedMatch: boolean;
  description: string;
}

const VisualRuleEditor: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [rules, setRules] = useState<FraudRule[]>([]);
  const [activeRule, setActiveRule] = useState<FraudRule | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [ruleHistory, setRuleHistory] = useState<any[]>([]);
  
  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // API calls
  const { data: existingRules, isLoading } = useQuery({
    queryKey: ['fraud-rules'],
    queryFn: () => apiRequest('/api/fraud/rules', 'GET')
  });

  const saveRuleMutation = useMutation({
    mutationFn: (rule: FraudRule) => {
      if (rule.id && rule.id !== 'new') {
        return apiRequest(`/api/fraud/rules/${rule.id}`, 'PUT', rule);
      } else {
        return apiRequest('/api/fraud/rules', 'POST', rule);
      }
    },
    onSuccess: () => {
      toast({ title: 'Rule saved successfully' });
      queryClient.invalidateQueries({ queryKey: ['fraud-rules'] });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({ title: 'Failed to save rule', variant: 'destructive' });
    }
  });

  const testRuleMutation = useMutation({
    mutationFn: (data: { rule: FraudRule; testCases: RuleTest[] }) => 
      apiRequest('/api/fraud/rules/test', 'POST', data),
    onSuccess: (results) => {
      setTestResults(results);
      toast({ title: 'Rule test completed' });
    }
  });

  // Rule management
  const createNewRule = () => {
    const newRule: FraudRule = {
      id: 'new',
      name: 'New Fraud Rule',
      type: 'ip_block',
      priority: 50,
      isActive: true,
      conditions: [],
      actions: [],
      description: ''
    };
    setActiveRule(newRule);
    setIsEditing(true);
  };

  const editRule = (rule: FraudRule) => {
    setActiveRule({ ...rule });
    setIsEditing(true);
  };

  const duplicateRule = (rule: FraudRule) => {
    const duplicated = {
      ...rule,
      id: 'new',
      name: `${rule.name} (Copy)`,
      isActive: false
    };
    setActiveRule(duplicated);
    setIsEditing(true);
  };

  const deleteRule = async (ruleId: string) => {
    try {
      await apiRequest(`/api/fraud/rules/${ruleId}`, 'DELETE');
      toast({ title: 'Rule deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['fraud-rules'] });
    } catch (error) {
      toast({ title: 'Failed to delete rule', variant: 'destructive' });
    }
  };

  // Condition management
  const addCondition = () => {
    if (!activeRule) return;
    
    const newCondition: Condition = {
      id: `cond_${Date.now()}`,
      field: 'ip_address',
      operator: 'equals',
      value: '',
      logic: activeRule.conditions.length > 0 ? 'AND' : undefined
    };
    
    setActiveRule({
      ...activeRule,
      conditions: [...activeRule.conditions, newCondition]
    });
  };

  const updateCondition = (conditionId: string, updates: Partial<Condition>) => {
    if (!activeRule) return;
    
    setActiveRule({
      ...activeRule,
      conditions: activeRule.conditions.map(c => 
        c.id === conditionId ? { ...c, ...updates } : c
      )
    });
  };

  const removeCondition = (conditionId: string) => {
    if (!activeRule) return;
    
    setActiveRule({
      ...activeRule,
      conditions: activeRule.conditions.filter(c => c.id !== conditionId)
    });
  };

  // Action management
  const addAction = () => {
    if (!activeRule) return;
    
    const newAction: Action = {
      id: `action_${Date.now()}`,
      type: 'block',
      params: {}
    };
    
    setActiveRule({
      ...activeRule,
      actions: [...activeRule.actions, newAction]
    });
  };

  const updateAction = (actionId: string, updates: Partial<Action>) => {
    if (!activeRule) return;
    
    setActiveRule({
      ...activeRule,
      actions: activeRule.actions.map(a => 
        a.id === actionId ? { ...a, ...updates } : a
      )
    });
  };

  const removeAction = (actionId: string) => {
    if (!activeRule) return;
    
    setActiveRule({
      ...activeRule,
      actions: activeRule.actions.filter(a => a.id !== actionId)
    });
  };

  // Drag and drop
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    if (active.data.current.type === 'condition') {
      if (!activeRule) return;
      
      const oldIndex = activeRule.conditions.findIndex(c => c.id === active.id);
      const newIndex = activeRule.conditions.findIndex(c => c.id === over.id);
      
      setActiveRule({
        ...activeRule,
        conditions: arrayMove(activeRule.conditions, oldIndex, newIndex)
      });
    } else if (active.data.current.type === 'action') {
      if (!activeRule) return;
      
      const oldIndex = activeRule.actions.findIndex(a => a.id === active.id);
      const newIndex = activeRule.actions.findIndex(a => a.id === over.id);
      
      setActiveRule({
        ...activeRule,
        actions: arrayMove(activeRule.actions, oldIndex, newIndex)
      });
    }
  };

  // Rule testing
  const testRule = () => {
    if (!activeRule) return;
    
    const testCases: RuleTest[] = [
      {
        input: { ip_address: '192.168.1.1', country: 'US', user_agent: 'Mozilla/5.0' },
        expectedMatch: true,
        description: 'Test case 1'
      },
      {
        input: { ip_address: '10.0.0.1', country: 'CA', user_agent: 'bot' },
        expectedMatch: false,
        description: 'Test case 2'
      }
    ];
    
    testRuleMutation.mutate({ rule: activeRule, testCases });
  };

  const previewRule = () => {
    setPreviewMode(true);
  };

  const saveRule = () => {
    if (!activeRule) return;
    saveRuleMutation.mutate(activeRule);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Fraud Rule Editor</h1>
          <p className="text-muted-foreground">Create and manage fraud detection rules with visual editor</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={createNewRule} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Rule
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rules List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {existingRules?.map((rule: FraudRule) => (
                  <div
                    key={rule.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      activeRule?.id === rule.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => editRule(rule)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{rule.name}</h4>
                        <p className="text-sm text-muted-foreground">Priority: {rule.priority}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {rule.isActive ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteRule(rule.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rule Editor */}
        <div className="lg:col-span-2">
          {activeRule ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Rule Editor</CardTitle>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={testRule}>
                        <Play className="h-4 w-4 mr-2" />
                        Test
                      </Button>
                      <Button size="sm" variant="outline" onClick={previewRule}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button size="sm" onClick={saveRule} disabled={saveRuleMutation.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="basic" className="space-y-4">
                    <TabsList>
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="conditions">Conditions</TabsTrigger>
                      <TabsTrigger value="actions">Actions</TabsTrigger>
                      <TabsTrigger value="test">Test</TabsTrigger>
                    </TabsList>

                    {/* Basic Info Tab */}
                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Rule Name</label>
                          <Input
                            value={activeRule.name}
                            onChange={(e) => setActiveRule({ ...activeRule, name: e.target.value })}
                            placeholder="Enter rule name"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Rule Type</label>
                          <Select
                            value={activeRule.type}
                            onValueChange={(value) => setActiveRule({ ...activeRule, type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {RULE_TYPES.map(type => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Priority (1-100)</label>
                          <Input
                            type="number"
                            min="1"
                            max="100"
                            value={activeRule.priority}
                            onChange={(e) => setActiveRule({ ...activeRule, priority: parseInt(e.target.value) })}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isActive"
                            checked={activeRule.isActive}
                            onChange={(e) => setActiveRule({ ...activeRule, isActive: e.target.checked })}
                          />
                          <label htmlFor="isActive" className="text-sm font-medium">
                            Active
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          value={activeRule.description || ''}
                          onChange={(e) => setActiveRule({ ...activeRule, description: e.target.value })}
                          placeholder="Describe what this rule does..."
                        />
                      </div>
                    </TabsContent>

                    {/* Conditions Tab */}
                    <TabsContent value="conditions" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Conditions</h3>
                        <Button size="sm" onClick={addCondition}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Condition
                        </Button>
                      </div>

                      <SortableContext items={activeRule.conditions.map(c => c.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-3">
                          {activeRule.conditions.map((condition, index) => (
                            <SortableItem
                              key={condition.id}
                              id={condition.id}
                              data={{ type: 'condition' }}
                            >
                              <ConditionEditor
                                condition={condition}
                                index={index}
                                isFirst={index === 0}
                                onUpdate={(updates) => updateCondition(condition.id, updates)}
                                onRemove={() => removeCondition(condition.id)}
                              />
                            </SortableItem>
                          ))}
                        </div>
                      </SortableContext>

                      {activeRule.conditions.length === 0 && (
                        <div className="text-center p-8 text-muted-foreground">
                          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                          <p>No conditions defined. Click "Add Condition" to start building your rule.</p>
                        </div>
                      )}
                    </TabsContent>

                    {/* Actions Tab */}
                    <TabsContent value="actions" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Actions</h3>
                        <Button size="sm" onClick={addAction}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Action
                        </Button>
                      </div>

                      <SortableContext items={activeRule.actions.map(a => a.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-3">
                          {activeRule.actions.map((action, index) => (
                            <SortableItem
                              key={action.id}
                              id={action.id}
                              data={{ type: 'action' }}
                            >
                              <ActionEditor
                                action={action}
                                onUpdate={(updates) => updateAction(action.id, updates)}
                                onRemove={() => removeAction(action.id)}
                              />
                            </SortableItem>
                          ))}
                        </div>
                      </SortableContext>

                      {activeRule.actions.length === 0 && (
                        <div className="text-center p-8 text-muted-foreground">
                          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                          <p>No actions defined. Click "Add Action" to define what happens when this rule matches.</p>
                        </div>
                      )}
                    </TabsContent>

                    {/* Test Tab */}
                    <TabsContent value="test" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Rule Testing</h3>
                        <Button size="sm" onClick={testRule} disabled={testRuleMutation.isPending}>
                          <Play className="h-4 w-4 mr-2" />
                          Run Test
                        </Button>
                      </div>

                      {testResults.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Test Results</h4>
                          {testResults.map((result, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between">
                                <span>{result.description}</span>
                                <Badge variant={result.success ? 'default' : 'destructive'}>
                                  {result.success ? 'PASS' : 'FAIL'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Expected: {result.expected ? 'Match' : 'No Match'}, 
                                Got: {result.actual ? 'Match' : 'No Match'}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </DndContext>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">No Rule Selected</h3>
                  <p className="text-muted-foreground mb-4">
                    Select an existing rule from the list or create a new one to start editing.
                  </p>
                  <Button onClick={createNewRule}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Rule
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Rule Preview Dialog */}
      <Dialog open={previewMode} onOpenChange={setPreviewMode}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rule Preview</DialogTitle>
          </DialogHeader>
          {activeRule && (
            <RulePreview rule={activeRule} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Condition Editor Component
interface ConditionEditorProps {
  condition: Condition;
  index: number;
  isFirst: boolean;
  onUpdate: (updates: Partial<Condition>) => void;
  onRemove: () => void;
}

const ConditionEditor: React.FC<ConditionEditorProps> = ({
  condition,
  index,
  isFirst,
  onUpdate,
  onRemove
}) => {
  const fieldOptions = [
    { value: 'ip_address', label: 'IP Address' },
    { value: 'country', label: 'Country' },
    { value: 'user_agent', label: 'User Agent' },
    { value: 'referer', label: 'Referer' },
    { value: 'device_type', label: 'Device Type' },
    { value: 'browser', label: 'Browser' },
    { value: 'click_rate', label: 'Click Rate' },
    { value: 'conversion_rate', label: 'Conversion Rate' }
  ];

  return (
    <div className="p-4 border rounded-lg bg-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {!isFirst && (
            <Select
              value={condition.logic || 'AND'}
              onValueChange={(value) => onUpdate({ logic: value as 'AND' | 'OR' })}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AND">AND</SelectItem>
                <SelectItem value="OR">OR</SelectItem>
              </SelectContent>
            </Select>
          )}
          <span className="text-sm font-medium">Condition {index + 1}</span>
        </div>
        <Button size="sm" variant="ghost" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Select
          value={condition.field}
          onValueChange={(value) => onUpdate({ field: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent>
            {fieldOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={condition.operator}
          onValueChange={(value) => onUpdate({ operator: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Operator" />
          </SelectTrigger>
          <SelectContent>
            {CONDITION_OPERATORS.map(op => (
              <SelectItem key={op.id} value={op.id}>
                {op.name} ({op.symbol})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          value={condition.value}
          onChange={(e) => onUpdate({ value: e.target.value })}
          placeholder="Value"
        />
      </div>
    </div>
  );
};

// Action Editor Component
interface ActionEditorProps {
  action: Action;
  onUpdate: (updates: Partial<Action>) => void;
  onRemove: () => void;
}

const ActionEditor: React.FC<ActionEditorProps> = ({ action, onUpdate, onRemove }) => {
  const actionType = ACTION_TYPES.find(t => t.id === action.type);

  return (
    <div className="p-4 border rounded-lg bg-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge style={{ backgroundColor: `var(--${actionType?.color}-500)` }}>
            {actionType?.name}
          </Badge>
        </div>
        <Button size="sm" variant="ghost" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <Select
          value={action.type}
          onValueChange={(value) => onUpdate({ type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACTION_TYPES.map(type => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Action-specific parameters */}
        {action.type === 'score' && (
          <Input
            type="number"
            placeholder="Score to add"
            value={action.params.score || ''}
            onChange={(e) => onUpdate({ 
              params: { ...action.params, score: parseInt(e.target.value) }
            })}
          />
        )}

        {action.type === 'redirect' && (
          <Input
            placeholder="Redirect URL"
            value={action.params.url || ''}
            onChange={(e) => onUpdate({ 
              params: { ...action.params, url: e.target.value }
            })}
          />
        )}

        {action.type === 'notify' && (
          <div className="space-y-2">
            <Input
              placeholder="Notification message"
              value={action.params.message || ''}
              onChange={(e) => onUpdate({ 
                params: { ...action.params, message: e.target.value }
              })}
            />
            <Select
              value={action.params.severity || 'medium'}
              onValueChange={(value) => onUpdate({ 
                params: { ...action.params, severity: value }
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};

// Rule Preview Component
interface RulePreviewProps {
  rule: FraudRule;
}

const RulePreview: React.FC<RulePreviewProps> = ({ rule }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">Rule Summary</h3>
        <p className="text-sm text-muted-foreground">{rule.description}</p>
      </div>

      <div>
        <h4 className="font-medium">Conditions</h4>
        <div className="mt-2 space-y-2">
          {rule.conditions.map((condition, index) => (
            <div key={condition.id} className="flex items-center gap-2 text-sm">
              {index > 0 && (
                <Badge variant="outline">{condition.logic}</Badge>
              )}
              <span>{condition.field}</span>
              <span className="font-mono">{CONDITION_OPERATORS.find(op => op.id === condition.operator)?.symbol}</span>
              <code className="px-2 py-1 bg-gray-100 rounded">{condition.value}</code>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium">Actions</h4>
        <div className="mt-2 space-y-2">
          {rule.actions.map((action) => {
            const actionType = ACTION_TYPES.find(t => t.id === action.type);
            return (
              <div key={action.id} className="flex items-center gap-2">
                <Badge>{actionType?.name}</Badge>
                {Object.keys(action.params).length > 0 && (
                  <code className="text-xs px-2 py-1 bg-gray-100 rounded">
                    {JSON.stringify(action.params)}
                  </code>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Priority:</span> {rule.priority}
          </div>
          <div>
            <span className="font-medium">Status:</span> {rule.isActive ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualRuleEditor;