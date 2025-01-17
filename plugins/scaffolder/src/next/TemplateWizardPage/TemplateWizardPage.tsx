/*
 * Copyright 2022 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { stringifyEntityRef } from '@backstage/catalog-model';
import {
  AnalyticsContext,
  useApi,
  useRouteRef,
  useRouteRefParams,
} from '@backstage/core-plugin-api';
import {
  scaffolderApiRef,
  useTemplateSecrets,
  NextFieldExtensionOptions,
} from '@backstage/plugin-scaffolder-react';
import { JsonValue } from '@backstage/types';
import { type FormProps } from '../types';
import { nextRouteRef } from '../routes';
import { scaffolderTaskRouteRef, selectedTemplateRouteRef } from '../../routes';
import { Header, Page } from '@backstage/core-components';
import { Workflow } from '@backstage/plugin-scaffolder-react';

type TemplateWizardPageProps = {
  customFieldExtensions: NextFieldExtensionOptions<any, any>[];
  FormProps?: FormProps;
};

export const TemplateWizardPage = (props: TemplateWizardPageProps) => {
  const rootRef = useRouteRef(nextRouteRef);
  const taskRoute = useRouteRef(scaffolderTaskRouteRef);
  const { secrets } = useTemplateSecrets();
  const scaffolderApi = useApi(scaffolderApiRef);
  const navigate = useNavigate();
  const { templateName, namespace } = useRouteRefParams(
    selectedTemplateRouteRef,
  );

  const templateRef = stringifyEntityRef({
    kind: 'Template',
    namespace,
    name: templateName,
  });

  const onCreate = async (values: Record<string, JsonValue>) => {
    const { taskId } = await scaffolderApi.scaffold({
      templateRef,
      values,
      secrets,
    });

    navigate(taskRoute({ taskId }));
  };

  const onError = () => <Navigate to={rootRef()} />;

  return (
    <AnalyticsContext attributes={{ entityRef: templateRef }}>
      <Page themeId="website">
        <Header
          pageTitleOverride="Create a new component"
          title="Create a new component"
          subtitle="Create new software components using standard templates in your organization"
        />
        <Workflow
          namespace={namespace}
          templateName={templateName}
          onCreate={onCreate}
          onError={onError}
          extensions={props.customFieldExtensions}
          FormProps={props.FormProps}
        />
      </Page>
    </AnalyticsContext>
  );
};
